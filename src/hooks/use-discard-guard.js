import { useCallback } from 'react';
import { useDialogStore } from '@/store/use-dialog-store';

export function useDiscardGuard(dirty, onClose, { busy = false } = {}) {
    return useCallback(async () => {
        if (busy) return;
        const dialog = useDialogStore.getState();
        if (dialog.current) return;
        if (!dirty) {
            onClose?.();
            return;
        }
        const discard = await dialog.confirm({
            title: '¿Descartar cambios?',
            message: 'Los datos que cargaste se van a perder.',
            tone: 'warning',
            confirmLabel: 'Descartar',
            cancelLabel: 'Seguir editando',
        });
        if (discard) onClose?.();
    }, [dirty, onClose, busy]);
}
