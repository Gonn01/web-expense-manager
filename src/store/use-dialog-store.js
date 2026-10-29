import { create } from 'zustand';

let idSeq = 0;

export const useDialogStore = create((set, get) => ({
    current: null,

    alert: ({ title = 'Error', message, tone = 'error', confirmLabel = 'Entendido' } = {}) => {
        get().current?.resolve?.(false);
        idSeq += 1;
        set({ current: { id: idSeq, kind: 'alert', title, message, tone, confirmLabel } });
    },

    confirm: ({
        title = '¿Estás seguro?',
        message,
        tone = 'warning',
        confirmLabel = 'Confirmar',
        cancelLabel = 'Cancelar',
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
        try {
            await current.onConfirm();
        } finally {
            if (get().current?.id === current.id) set({ current: null });
            current.resolve?.(true);
        }
    },

    close: (result = false) => {
        const current = get().current;
        if (current?.busy) return;
        current?.resolve?.(result);
        set({ current: null });
    },
}));
