import { useCallback } from 'react';
import { useDialogStore } from '@/store/use-dialog-store';
import { t } from '@/i18n';

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
            title: t('common.discardChanges'),
            message: t('common.theDataYouEnteredWillBeLost'),
            tone: 'warning',
            confirmLabel: t('common.discard'),
            cancelLabel: t('common.keepEditing'),
        });
        if (discard) onClose?.();
    }, [dirty, onClose, busy]);
}
