import axios, { AxiosError } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const routes = new Map();
const calls = [];

function respond(method, url, body, status = 200) {
    routes.set(`${method} ${url}`, () => ({ body: { data: body }, status }));
}

function respondError(method, url, status = 500, code = 'ERROR_DE_TEST') {
    routes.set(`${method} ${url}`, () => ({ body: { error: 'falló', code }, status }));
}

function callsTo(method, url) {
    return calls.filter((call) => call.key === `${method} ${url}`);
}

axios.defaults.adapter = async (config) => {
    const key = `${config.method} ${config.url}`;
    calls.push({
        key,
        body: config.data ? JSON.parse(config.data) : null,
        authorization: config.headers.Authorization,
    });
    const route = routes.get(key);
    if (!route) throw new Error(`Ruta sin respuesta de test: ${key}`);
    const { body, status } = await route();
    const response = { data: body, status, statusText: '', headers: {}, config };
    if (status >= 400) throw new AxiosError('falló', 'ERR_BAD_RESPONSE', config, null, response);
    return response;
};

vi.stubGlobal('localStorage', {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
});

const { default: useAuth } = await import('@/store/use-auth-store');
const { useCompartidosStore } = await import('@/store/use-compartidos-store');
const { useSettlementStore } = await import('@/store/use-settlement-store');

const SESSION_URL = '/settlement/session';
const ITEMS_URL = '/settlement/session/items';
const FINISH_URL = '/settlement/session/finish';

const store = () => useSettlementStore.getState();
const openSession = (checkedExpenses = {}) =>
    useSettlementStore.setState({ active: true, session: { id: 1 }, checkedExpenses });

beforeEach(() => {
    routes.clear();
    calls.length = 0;
    vi.spyOn(console, 'error').mockImplementation(() => {});
    useAuth.setState({ token: 'token' });
    useCompartidosStore.setState({ pendingPaymentsCount: 0 });
    useSettlementStore.setState({
        active: false,
        session: null,
        checkedExpenses: {},
        pendingIds: {},
        loading: false,
        loaded: false,
    });
});

describe('loadSession', () => {
    it('no llama a la API sin token', async () => {
        useAuth.setState({ token: null });

        await store().loadSession();

        expect(calls).toHaveLength(0);
    });

    it('carga la sesión y sus marcas con ids como texto', async () => {
        respond('get', SESSION_URL, {
            session: { id: 1 },
            items: [{ purchase_id: 5, checked_at: 'hoy' }],
        });

        await store().loadSession();

        expect(calls[0].authorization).toBe('Bearer token');
        expect(store()).toMatchObject({
            active: true,
            loaded: true,
            loading: false,
            checkedExpenses: { 5: { checked_at: 'hoy' } },
        });
        expect(store().isChecked(5)).toBe(true);
        expect(store().isChecked('5')).toBe(true);
    });

    it('limpia el estado si no hay sesión abierta', async () => {
        openSession({ 5: { checked_at: 'hoy' } });
        respond('get', SESSION_URL, { session: null });

        await store().loadSession();

        expect(store()).toMatchObject({ active: false, session: null, checkedExpenses: {} });
    });

    it('termina la carga aunque falle', async () => {
        respondError('get', SESSION_URL);

        await store().loadSession();

        expect(store()).toMatchObject({ loading: false, loaded: true });
    });
});

describe('finishSession', () => {
    it('no hace nada sin sesión', async () => {
        await expect(store().finishSession()).resolves.toBeNull();

        expect(calls).toHaveLength(0);
    });

    it('cierra la sesión y descuenta las confirmaciones', async () => {
        openSession({ 1: {} });
        useCompartidosStore.setState({ pendingPaymentsCount: 5 });
        const snapshot = {
            items: [
                { payment_role: 'confirmacion' },
                { payment_role: 'pago' },
                { payment_role: 'confirmacion' },
            ],
        };
        respond('post', FINISH_URL, snapshot);

        await expect(store().finishSession()).resolves.toEqual(snapshot);

        expect(useCompartidosStore.getState().pendingPaymentsCount).toBe(3);
        expect(store()).toMatchObject({ active: false, session: null, checkedExpenses: {} });
    });

    it('no deja el contador de pagos por debajo de cero', async () => {
        openSession({ 1: {} });
        useCompartidosStore.setState({ pendingPaymentsCount: 1 });
        respond('post', FINISH_URL, {
            items: [{ payment_role: 'confirmacion' }, { payment_role: 'confirmacion' }],
        });

        await store().finishSession();

        expect(useCompartidosStore.getState().pendingPaymentsCount).toBe(0);
    });

    it('no toca el contador si no hubo confirmaciones', async () => {
        openSession();
        useCompartidosStore.setState({ pendingPaymentsCount: 2 });
        respond('post', FINISH_URL, { items: [{ payment_role: 'pago' }] });

        await store().finishSession();

        expect(useCompartidosStore.getState().pendingPaymentsCount).toBe(2);
    });

    it('mantiene la sesión si falla el cierre', async () => {
        openSession({ 1: {} });
        respondError('post', FINISH_URL);

        await expect(store().finishSession()).resolves.toBeNull();

        expect(store().active).toBe(true);
        expect(store().isChecked(1)).toBe(true);
        expect(callsTo('get', SESSION_URL)).toHaveLength(0);
    });

    it('recarga la sesión si el servidor la considera vacía', async () => {
        openSession({ 1: {} });
        respondError('post', FINISH_URL, 409, 'SETTLEMENT_EMPTY');
        respond('get', SESSION_URL, { session: { id: 1 }, items: [] });

        await store().finishSession();
        await vi.waitFor(() => expect(store().isChecked(1)).toBe(false));

        expect(callsTo('get', SESSION_URL)).toHaveLength(1);
    });
});

describe('discardSession', () => {
    it('limpia el estado aunque falle la API', async () => {
        openSession({ 1: {} });
        respondError('delete', SESSION_URL);

        await store().discardSession();

        expect(store()).toMatchObject({ active: false, session: null, checkedExpenses: {} });
    });
});

describe('marcar gastos', () => {
    it('no marca sin sesión', async () => {
        await store().toggleExpense({ id: 5 });

        expect(calls).toHaveLength(0);
    });

    it('marca un gasto sin marcar', async () => {
        openSession();
        respond('put', ITEMS_URL, { items: [{ purchase_id: 5, checked_at: 'hoy' }] });

        await store().toggleExpense({ id: 5 });

        expect(calls[0].body).toEqual({ purchase_id: 5, checked: true });
        expect(store().isChecked(5)).toBe(true);
    });

    it('desmarca un gasto marcado', async () => {
        openSession({ 5: { checked_at: 'hoy' } });
        respond('put', ITEMS_URL, { items: [] });

        await store().toggleExpense({ id: 5 });

        expect(calls[0].body).toEqual({ purchase_id: 5, checked: false });
        expect(store().isChecked(5)).toBe(false);
    });

    it('indica pendiente solo mientras dura la llamada', async () => {
        openSession();
        let resolveCall;
        routes.set(
            `put ${ITEMS_URL}`,
            () =>
                new Promise((resolve) => {
                    resolveCall = () => resolve({ body: { data: { items: [] } }, status: 200 });
                }),
        );

        const toggling = store().toggleExpense({ id: 5 });
        expect(store().isPending(5)).toBe(true);

        await vi.waitFor(() => expect(resolveCall).toBeDefined());
        resolveCall();
        await toggling;

        expect(store().isPending(5)).toBe(false);
    });

    it('conserva las marcas y libera el pendiente si falla', async () => {
        openSession({ 7: { checked_at: 'ayer' } });
        respondError('put', ITEMS_URL);

        await store().toggleExpense({ id: 5 });

        expect(store().isChecked(7)).toBe(true);
        expect(store().isChecked(5)).toBe(false);
        expect(store().isPending(5)).toBe(false);
    });

    it('marca varios gastos en una sola llamada', async () => {
        openSession();
        respond('put', ITEMS_URL, { items: [{ purchase_id: 1 }, { purchase_id: 2 }] });

        await store().setExpensesChecked([{ id: 1 }, { id: 2 }], 'Banco', true);

        expect(calls).toHaveLength(1);
        expect(calls[0].body).toEqual({ purchase_ids: [1, 2], checked: true });
    });

    it('no llama a la API con una lista vacía', async () => {
        openSession();

        await store().setExpensesChecked([], 'Banco', true);

        expect(calls).toHaveLength(0);
    });
});

describe('applyMarked y applyUnmarked', () => {
    it('agrega marcas sin pisar las existentes', () => {
        openSession({ 1: { checked_at: 'ayer' } });

        store().applyMarked([1, 2]);

        expect(store().checkedExpenses).toEqual({
            1: { checked_at: 'ayer' },
            2: { checked_at: null },
        });
    });

    it('no agrega marcas sin sesión', () => {
        store().applyMarked([1]);

        expect(store().checkedExpenses).toEqual({});
    });

    it('quita marcas', () => {
        openSession({ 1: {}, 2: {} });

        store().applyUnmarked(['1']);

        expect(store().checkedExpenses).toEqual({ 2: {} });
    });
});
