import { create } from 'zustand';
import useAuth from '@/store/use-auth-store';
import { useSnackbarStore } from '@/store/use-snackbar-store';
import {
    fetchSettlementSession,
    startSettlementSession,
    setSettlementItem,
    finishSettlementSession,
    discardSettlementSession,
} from '@/services/api';

const token = () => useAuth.getState().token;
const toast = (msg, type = 'error') => useSnackbarStore.getState().show(msg, type);

/** items: [{ purchase_id, checked_at }] -> { [id]: { checked_at } } */
function itemsToMap(items = []) {
    const map = {};
    for (const it of items) {
        map[String(it.purchase_id)] = { checked_at: it.checked_at };
    }
    return map;
}

/** Marca `ids` como "en curso" mientras corre `fn`, y los libera al terminar. */
async function withPending(set, ids, fn) {
    const keys = ids.map(String);
    set((s) => {
        const next = { ...s.pendingIds };
        for (const k of keys) next[k] = true;
        return { pendingIds: next };
    });
    try {
        return await fn();
    } finally {
        set((s) => {
            const next = { ...s.pendingIds };
            for (const k of keys) delete next[k];
            return { pendingIds: next };
        });
    }
}

/**
 * "Modo hacer cuentas". La sesión y las marcas viven en la DB
 * (endpoints /settlement/*), así el usuario puede retomarla cuando quiera
 * y desde cualquier dispositivo. El store solo cachea el estado del server.
 */
export const useSettlementStore = create((set, get) => ({
    active: false,
    session: null, // { id, started_at } | null
    checkedExpenses: {}, // { [purchaseId]: { checked_at } }
    // Gastos con un pedido de marcar/desmarcar en curso: la interfaz muestra
    // un spinner hasta que responde el servidor (no hay cambios optimistas).
    pendingIds: {}, // { [purchaseId]: true }
    loading: false,
    loaded: false,

    loadSession: async () => {
        if (!token()) return;
        set({ loading: true });
        try {
            const data = await fetchSettlementSession(token());
            if (data?.session) {
                set({
                    active: true,
                    session: data.session,
                    checkedExpenses: itemsToMap(data.items),
                });
            } else {
                set({ active: false, session: null, checkedExpenses: {} });
            }
        } catch (err) {
            console.error('Error cargando sesión de cuentas:', err);
        } finally {
            set({ loading: false, loaded: true });
        }
    },

    startSession: async () => {
        if (!token()) return;
        try {
            const data = await startSettlementSession(token());
            set({ active: true, session: data.session, checkedExpenses: itemsToMap(data.items) });
            toast('Modo hacer cuentas activado.', 'success');
        } catch (err) {
            console.error('Error iniciando sesión de cuentas:', err);
        }
    },

    finishSession: async () => {
        if (!get().session) return null;
        try {
            const snapshot = await finishSettlementSession(token());
            set({ active: false, session: null, checkedExpenses: {} });
            return snapshot;
        } catch (err) {
            console.error('Error cerrando sesión de cuentas:', err);
            // La API sacó de la sesión los marcados que ya no se podían pagar y
            // no quedó ninguno: se resincronizan las marcas (la sesión sigue abierta).
            if (err?.code === 'SETTLEMENT_EMPTY') get().loadSession();
            return null;
        }
    },

    discardSession: async () => {
        if (!get().session) return;
        try {
            await discardSettlementSession(token());
        } catch (err) {
            console.error('Error descartando sesión de cuentas:', err);
        } finally {
            set({ active: false, session: null, checkedExpenses: {} });
        }
    },

    isChecked: (id) => Boolean(get().checkedExpenses[String(id)]),

    isPending: (id) => Boolean(get().pendingIds[String(id)]),

    toggleExpense: async (expense) => {
        const { session, checkedExpenses } = get();
        if (!session) return;
        const checked = !checkedExpenses[String(expense.id)];
        await withPending(set, [expense.id], async () => {
            try {
                const data = await setSettlementItem({ purchase_id: expense.id, checked }, token());
                set({ checkedExpenses: itemsToMap(data.items) });
            } catch (err) {
                // El interceptor ya mostró el error; las marcas no cambiaron.
                console.error('Error marcando gasto:', err);
            }
        });
    },

    setExpensesChecked: async (expenses, _entityName, checked) => {
        const { session } = get();
        if (!session || !expenses?.length) return;
        const ids = expenses.map((e) => e.id);
        await withPending(set, ids, async () => {
            try {
                const data = await setSettlementItem({ purchase_ids: ids, checked }, token());
                set({ checkedExpenses: itemsToMap(data.items) });
            } catch (err) {
                console.error('Error marcando entidad:', err);
            }
        });
    },

    /**
     * Tras marcar desde el diálogo de pago (POST settle-quota / settle-lote):
     * el servidor ya confirmó que estos gastos quedaron marcados en la sesión,
     * así que se reflejan directo sin volver a pedir la sesión.
     */
    applyMarked: (ids) => {
        if (!get().session || !ids?.length) return;
        set((s) => {
            const next = { ...s.checkedExpenses };
            for (const id of ids) next[String(id)] = next[String(id)] ?? { checked_at: null };
            return { checkedExpenses: next };
        });
    },
}));
