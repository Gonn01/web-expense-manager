import { create } from 'zustand';
import useAuth from '@/store/use-auth-store';
import { useSnackbarStore } from '@/store/use-snackbar-store';
import {
    fetchReconcileSession,
    startReconcileSession,
    setReconcileItem,
    finishReconcileSession,
    discardReconcileSession,
} from '@/services/api';

const token = () => useAuth.getState().token;
const toast = (msg, type = 'error') => useSnackbarStore.getState().show(msg, type);

/** items: [{ purchase_id, auto, checked_at }] -> { [id]: { auto, checked_at } } */
function itemsToMap(items = []) {
    const map = {};
    for (const it of items) {
        map[String(it.purchase_id)] = { auto: it.auto, checked_at: it.checked_at };
    }
    return map;
}

/**
 * "Modo hacer cuentas". La sesión y las marcas viven en la DB
 * (endpoints /reconcile/*), así el usuario puede retomarla cuando quiera
 * y desde cualquier dispositivo. El store solo cachea el estado del server.
 */
export const useReconcileStore = create((set, get) => ({
    active: false,
    session: null, // { id, started_at } | null
    checkedExpenses: {}, // { [purchaseId]: { auto, checked_at } }
    loading: false,
    loaded: false,

    loadSession: async () => {
        if (!token()) return;
        set({ loading: true });
        try {
            const data = await fetchReconcileSession(token());
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
            const data = await startReconcileSession(token());
            set({ active: true, session: data.session, checkedExpenses: itemsToMap(data.items) });
            toast('Modo hacer cuentas activado.', 'success');
        } catch (err) {
            console.error('Error iniciando sesión de cuentas:', err);
        }
    },

    finishSession: async () => {
        if (!get().session) return null;
        try {
            const snapshot = await finishReconcileSession(token());
            set({ active: false, session: null, checkedExpenses: {} });
            return snapshot;
        } catch (err) {
            console.error('Error cerrando sesión de cuentas:', err);
            return null;
        }
    },

    discardSession: async () => {
        if (!get().session) return;
        try {
            await discardReconcileSession(token());
        } catch (err) {
            console.error('Error descartando sesión de cuentas:', err);
        } finally {
            set({ active: false, session: null, checkedExpenses: {} });
        }
    },

    isChecked: (id) => Boolean(get().checkedExpenses[String(id)]),

    toggleExpense: async (expense) => {
        const { session, checkedExpenses } = get();
        if (!session) return;
        const id = String(expense.id);
        const wasChecked = Boolean(checkedExpenses[id]);
        const checked = !wasChecked;

        // Optimista
        set((s) => {
            const next = { ...s.checkedExpenses };
            if (checked) next[id] = { auto: false, checked_at: new Date().toISOString() };
            else delete next[id];
            return { checkedExpenses: next };
        });

        try {
            const data = await setReconcileItem({ purchase_id: expense.id, checked }, token());
            set({ checkedExpenses: itemsToMap(data.items) });
        } catch (err) {
            console.error('Error marcando gasto:', err);
            // Revertir (el interceptor ya mostró el error)
            set((s) => {
                const next = { ...s.checkedExpenses };
                if (wasChecked) next[id] = checkedExpenses[id];
                else delete next[id];
                return { checkedExpenses: next };
            });
        }
    },

    setExpensesChecked: async (expenses, _entityName, checked) => {
        const { session } = get();
        if (!session || !expenses?.length) return;
        const ids = expenses.map((e) => e.id);
        const prev = get().checkedExpenses;

        // Optimista
        set((s) => {
            const next = { ...s.checkedExpenses };
            for (const e of expenses) {
                const id = String(e.id);
                if (checked)
                    next[id] = next[id] ?? { auto: false, checked_at: new Date().toISOString() };
                else delete next[id];
            }
            return { checkedExpenses: next };
        });

        try {
            const data = await setReconcileItem({ purchase_ids: ids, checked }, token());
            set({ checkedExpenses: itemsToMap(data.items) });
        } catch (err) {
            console.error('Error marcando entidad:', err);
            set({ checkedExpenses: prev });
        }
    },

    /** Tras un pago real: el backend ya marcó el item, resincronizamos. */
    refreshAfterPayment: async () => {
        if (!get().session) return;
        try {
            const data = await fetchReconcileSession(token());
            if (data?.session) set({ checkedExpenses: itemsToMap(data.items) });
        } catch {
            /* noop */
        }
    },
}));
