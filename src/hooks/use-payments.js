import { useCallback } from 'react';
import { pagarCuota, pagarCuotasLote } from '@/services/api';
import { useReconcileStore } from '@/store/use-reconcile-store';
import { useSnackbarStore } from '@/store/use-snackbar-store';

const RECONCILE_MSG = 'Activá el modo "Hacer cuentas" para marcar pagos desde acá.';

/** ¿Hay una sesión de "hacer cuentas" abierta? (sin efectos secundarios) */
export function isReconcileActive() {
    return useReconcileStore.getState().active;
}

/**
 * Verificador para el flujo de "marcar" del dashboard (pago en lote), que sí
 * necesita una sesión abierta. En el detalle de gasto NO se usa: ahí se puede
 * pagar/revertir sin sesión (queda solo en el historial del gasto).
 */
export function ensureReconcileActive() {
    if (isReconcileActive()) return true;
    useSnackbarStore.getState().show(RECONCILE_MSG, 'error', 'playlist_add_check');
    return false;
}

export function usePayments(token, onPaid) {
    const handleConfirm = useCallback(
        async (items) => {
            try {
                if (!items.length) return [];
                if (!ensureReconcileActive()) return [];

                let updatedItems;
                if (items.length === 1) {
                    updatedItems = [await pagarCuota(items[0].id, token)];
                } else {
                    const ids = items.map((it) => it.id);

                    const { updated } = await pagarCuotasLote(ids, token);
                    updatedItems = updated;
                }

                // El backend marcó los items en la sesión; resincronizamos.
                // El pago real se registra al terminar las cuentas.
                useReconcileStore.getState().refreshAfterPayment();

                useSnackbarStore
                    .getState()
                    .show(
                        updatedItems.length === 1
                            ? 'Gasto marcado. Se registra al terminar las cuentas.'
                            : `${updatedItems.length} gastos marcados. Se registran al terminar las cuentas.`,
                        'success',
                        'playlist_add_check',
                    );

                onPaid?.();
                return updatedItems;
            } catch (err) {
                // El interceptor de axios ya mostró el mensaje según el código.
                console.error('Error pagando cuotas:', err);
                return [];
            }
        },
        [onPaid, token],
    );

    return { handleConfirm };
}
