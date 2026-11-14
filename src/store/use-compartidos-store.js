import { create } from 'zustand';
import { fetchCompartidos } from '@/services/api';

export const useCompartidosStore = create((set) => ({
    pendingCount: 0,
    pendingPaymentsCount: 0,

    setPendingCount: (count) =>
        set((s) => ({
            pendingCount: typeof count === 'function' ? count(s.pendingCount) : count,
        })),

    setPendingPaymentsCount: (count) =>
        set((s) => ({
            pendingPaymentsCount:
                typeof count === 'function' ? count(s.pendingPaymentsCount) : count,
        })),

    loadPendingCount: async (token) => {
        if (!token) return;
        try {
            const data = await fetchCompartidos(token);
            const count = data.recibidos.filter((r) => r.status === 'PENDING_APPROVAL').length;
            const porConfirmar =
                (data.pagos?.porConfirmar.length ?? 0) +
                (data.reversiones?.porConfirmar.length ?? 0);
            set({ pendingCount: count, pendingPaymentsCount: porConfirmar });
        } catch (err) {
            console.error('Error cargando compartidos pendientes', err);
        }
    },
}));
