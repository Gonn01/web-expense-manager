import { create } from 'zustand';
import { t } from '@/i18n';

let idSeq = 0;

export const useDialogStore = create((set, get) => ({
    current: null,

    alert: ({
        title = t('dialog.error'),
        message,
        tone = 'error',
        confirmLabel = t('dialog.understood'),
    } = {}) => {
        get().current?.resolve?.(false);
        idSeq += 1;
        set({ current: { id: idSeq, kind: 'alert', title, message, tone, confirmLabel } });
    },

    confirm: ({
        title = t('dialog.areYouSure'),
        message,
        tone = 'warning',
        confirmLabel = t('common.confirm'),
        cancelLabel = t('common.cancel'),
        onConfirm,
    } = {}) =>
        new Promise((resolve) => {
            get().current?.resolve?.(false);
            idSeq += 1;
            set({
                current: {
                    id: idSeq,
                    kind: 'confirm',
                    title,
                    message,
                    tone,
                    confirmLabel,
                    cancelLabel,
                    resolve,
                    onConfirm,
                    busy: false,
                },
            });
        }),

    accept: async () => {
        const current = get().current;
        if (!current || current.busy) return;
        if (!current.onConfirm) {
            get().close(true);
            return;
        }

        set({ current: { ...current, busy: true } });
        let succeeded = false;
        try {
            await current.onConfirm();
            succeeded = true;
        } catch (err) {
            console.error('Error en la acción confirmada', err);
        } finally {
            if (get().current?.id === current.id) set({ current: null });
            current.resolve?.(succeeded);
        }
    },

    close: (result = false) => {
        const current = get().current;
        if (current?.busy) return;
        current?.resolve?.(result);
        set({ current: null });
    },
}));
