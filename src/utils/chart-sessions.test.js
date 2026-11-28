import { describe, expect, it } from 'vitest';
import {
    categoryEntriesForSession,
    expenseAmountInSession,
    fixedExpenseStartSession,
    futureQuotaTotals,
    hasChartData,
    lastSessionWithQuotas,
    postponedExpenseCount,
    pastQuotaTotal,
    pendingQuotaSessions,
    sessionAt,
    sessionColumns,
} from './chart-sessions';

const cuotas = (overrides = {}) => ({
    type: 'EGRESO',
    fixed_expense: false,
    number_of_quotas: 3,
    payed_quotas: 1,
    amount: 300,
    amount_per_quota: 100,
    currency_type: 'ARS',
    ...overrides,
});

const fijo = (overrides = {}) => ({
    type: 'EGRESO',
    fixed_expense: true,
    number_of_quotas: 1,
    payed_quotas: 0,
    amount: 50,
    amount_per_quota: 50,
    currency_type: 'ARS',
    ...overrides,
});

const sesion = (id, items) => ({ id, finished_at: '2026-11-03T15:00:00Z', items });

describe('pendingQuotaSessions', () => {
    it('cada cuota pendiente ocupa una sesión, empezando por la próxima', () => {
        expect(pendingQuotaSessions(cuotas())).toEqual({ start: 0, end: 1 });
    });

    it('un gasto postergado empieza una sesión después', () => {
        expect(pendingQuotaSessions(cuotas({ is_postponed: true }))).toEqual({ start: 1, end: 2 });
    });

    it('no proyecta gastos fijos ni gastos saldados', () => {
        expect(pendingQuotaSessions(fijo())).toBeNull();
        expect(pendingQuotaSessions(cuotas({ payed_quotas: 3 }))).toBeNull();
    });
});

describe('montos por sesión', () => {
    it('un gasto fijo cuenta su monto desde la próxima sesión, o la siguiente si está postergado', () => {
        expect(fixedExpenseStartSession(fijo())).toBe(0);
        expect(expenseAmountInSession(fijo(), 5)).toBe(50);
        expect(expenseAmountInSession(fijo({ is_postponed: true }), 0)).toBe(0);
    });

    it('un gasto en cuotas cuenta una cuota por sesión mientras le queden', () => {
        expect(expenseAmountInSession(cuotas(), 0)).toBe(100);
        expect(expenseAmountInSession(cuotas(), 1)).toBe(100);
        expect(expenseAmountInSession(cuotas(), 2)).toBe(0);
    });

    it('la última sesión con cuotas es la del gasto que más tarda en terminar', () => {
        expect(lastSessionWithQuotas([cuotas(), cuotas({ number_of_quotas: 6 })])).toBe(4);
        expect(lastSessionWithQuotas([])).toBe(0);
    });
});

describe('futureQuotaTotals y pastQuotaTotal', () => {
    it('cuenta cuotas por sesión futura y por tipo', () => {
        const totals = futureQuotaTotals(
            [cuotas(), cuotas({ number_of_quotas: 2 }), cuotas({ type: 'INGRESO' })],
            'EGRESO',
        );

        expect([...totals.entries()]).toEqual([
            [0, 2],
            [1, 1],
        ]);
    });

    it('suma los montos convertidos y omite los que no se pueden convertir', () => {
        const valueOf = (amount, currency) => (currency === 'USD' ? null : amount);
        const totals = futureQuotaTotals(
            [cuotas(), cuotas({ currency_type: 'USD' })],
            'EGRESO',
            valueOf,
        );

        expect(totals.get(0)).toBe(100);
    });

    it('una sesión pasada cuenta sus gastos en cuotas del tipo pedido, sin los fijos', () => {
        const pasada = sesion(1, [
            { type: 'EGRESO', fixed_expense: false, amount_per_quota: 10, currency: 'ARS' },
            { type: 'EGRESO', fixed_expense: true, amount_per_quota: 99, currency: 'ARS' },
            { type: 'INGRESO', fixed_expense: false, amount_per_quota: 5, currency: 'ARS' },
        ]);

        expect(pastQuotaTotal(pasada, 'EGRESO')).toBe(1);
        expect(pastQuotaTotal(pasada, 'EGRESO', (amount) => amount)).toBe(10);
    });
});

describe('sessionColumns', () => {
    it('pone las sesiones pasadas de la más vieja a la más nueva y después las próximas', () => {
        const history = [sesion(9, []), sesion(8, [])];

        const columns = sessionColumns([cuotas()], history);

        expect(columns.map((c) => c.index)).toEqual([-2, -1, 0, 1]);
        expect(columns[0].session.id).toBe(8);
        expect(columns[1].session.id).toBe(9);
    });

    it('sin gastos activos muestra igual la próxima sesión', () => {
        expect(sessionColumns([], []).map((c) => c.index)).toEqual([0]);
    });
});

describe('categoryEntriesForSession', () => {
    it('una sesión pasada usa los egresos guardados con sus categorías', () => {
        const history = [
            sesion(9, [
                {
                    type: 'EGRESO',
                    amount_per_quota: 10,
                    currency: 'ARS',
                    categories: [{ id: 1, name: 'Hogar' }],
                },
                { type: 'INGRESO', amount_per_quota: 5, currency: 'ARS', categories: [] },
            ]),
        ];

        expect(categoryEntriesForSession([], history, -1)).toEqual([
            { amount: 10, currency: 'ARS', categories: [{ id: 1, name: 'Hogar' }] },
        ]);
    });

    it('con el tipo ingreso reparte los ingresos de la sesión', () => {
        const history = [
            sesion(9, [
                { type: 'EGRESO', amount_per_quota: 10, currency: 'ARS', categories: [] },
                { type: 'INGRESO', amount_per_quota: 5, currency: 'ARS', categories: [] },
            ]),
        ];

        expect(categoryEntriesForSession([], history, -1, 'INGRESO')).toEqual([
            { amount: 5, currency: 'ARS', categories: [] },
        ]);
        expect(
            categoryEntriesForSession([cuotas(), cuotas({ type: 'INGRESO' })], [], 0, 'INGRESO'),
        ).toEqual([{ amount: 100, currency: 'ARS', categories: [] }]);
    });

    it('una sesión futura proyecta los egresos activos', () => {
        expect(categoryEntriesForSession([cuotas(), fijo()], [], 2)).toEqual([
            { amount: 0, currency: 'ARS', categories: [] },
            { amount: 50, currency: 'ARS', categories: [] },
        ]);
    });
});

describe('hasChartData', () => {
    it('hay datos con egresos activos o con sesiones pasadas que tengan gastos', () => {
        expect(hasChartData([cuotas()], [])).toBe(true);
        expect(hasChartData([], [sesion(1, [{ type: 'EGRESO' }])])).toBe(true);
        expect(hasChartData([], [sesion(1, [])])).toBe(false);
    });
});

describe('sessionAt', () => {
    it('devuelve la sesión pasada de cada índice negativo', () => {
        const history = [sesion(9, []), sesion(8, [])];

        expect(sessionAt(history, -1).id).toBe(9);
        expect(sessionAt(history, -2).id).toBe(8);
        expect(sessionAt(history, 0)).toBeNull();
        expect(sessionAt(history, -3)).toBeNull();
    });
});

describe('postponedExpenseCount', () => {
    it('cuenta los postergados que tienen algo para proyectar', () => {
        const base = { amount: 300, amount_per_quota: 100, number_of_quotas: 3, payed_quotas: 1 };
        expect(
            postponedExpenseCount([
                { ...base, is_postponed: true },
                { amount: 50, fixed_expense: true, is_postponed: true },
                { ...base },
                { ...base, payed_quotas: 3, is_postponed: true },
            ]),
        ).toBe(2);
        expect(postponedExpenseCount([])).toBe(0);
    });
});
