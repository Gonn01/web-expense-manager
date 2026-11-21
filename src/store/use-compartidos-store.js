import { create } from 'zustand';
import { fetchCompartidos } from '@/services/api';
import { countGastosPorResolver } from '@/utils/compartidos-pending';

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
            const count = countGastosPorResolver(data);
            const porConfirmar =
                (data.pagos?.porConfirmar.length ?? 0) +
                (data.reversiones?.porConfirmar.length ?? 0) +
                (data.ediciones?.porConfirmar.length ?? 0);
            set({ pendingCount: count, pendingPaymentsCount: porConfirmar });
        } catch (err) {
            console.error('Error cargando compartidos pendientes', err);
        }
    },
}));
