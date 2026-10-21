import { useCallback } from 'react';
import { settleQuota, settleQuotasLote } from '@/services/api';
import { useSettlementStore } from '@/store/use-settlement-store';
import { useSnackbarStore } from '@/store/use-snackbar-store';

const SETTLEMENT_MSG = 'Activá el modo "Hacer cuentas" para marcar pagos desde acá.';

export function isSettlementActive() {
    return useSettlementStore.getState().active;
}

export function ensureSettlementActive() {
    if (isSettlementActive()) return true;
    useSnackbarStore.getState().show(SETTLEMENT_MSG, 'error', 'playlist_add_check');
    return false;
}

export function useSettlements(token, onPaid) {
    const handleConfirm = useCallback(
        async (items) => {
            try {
                if (!items.length) return [];
                if (!ensureSettlementActive()) return [];

                let updatedItems;
                if (items.length === 1) {
                    updatedItems = [await settleQuota(items[0].id, token)];
                } else {
                    const ids = items.map((it) => it.id);

                    const { updated } = await settleQuotasLote(ids, token);
                    updatedItems = updated;
                }

                useSettlementStore.getState().applyMarked(updatedItems.map((it) => it.id));

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
                console.error('Error pagando cuotas:', err);
                return [];
            }
        },
        [onPaid, token],
    );

    return { handleConfirm };
}
