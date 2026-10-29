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

function itemsToMap(items = []) {
    const map = {};
    for (const it of items) {
        map[String(it.purchase_id)] = { checked_at: it.checked_at };
    }
    return map;
}

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

export const useSettlementStore = create((set, get) => ({
    active: false,
    session: null,
    checkedExpenses: {},
    pendingIds: {},
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

    applyMarked: (ids) => {
        if (!get().session || !ids?.length) return;
        set((s) => {
            const next = { ...s.checkedExpenses };
            for (const id of ids) next[String(id)] = next[String(id)] ?? { checked_at: null };
            return { checkedExpenses: next };
        });
    },
}));
