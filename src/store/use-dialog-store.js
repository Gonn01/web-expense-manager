import { create } from 'zustand';

let idSeq = 0;

/**
 * Dialog global. Cualquier parte de la app, incluso fuera de React, puede abrirlo:
 *
 *   useDialogStore.getState().alert({ title, message, tone })
 *     → acknowledgement de un solo botón ("Entendido").
 *
 *   const ok = await useDialogStore.getState().confirm({ title, message, tone, confirmLabel })
 *     → aceptar / cancelar; resuelve `true` si confirma, `false` si cancela
 *       (botón, Escape o click afuera). Reemplaza al `window.confirm` nativo.
 *
 *   await useDialogStore.getState().confirm({ ..., onConfirm: async () => { ... } })
 *     → con `onConfirm`, al confirmar el dialog queda abierto y bloqueado
 *       (spinner en el botón, sin cancelar, sin Escape ni click afuera) hasta
 *       que la acción termina; recién ahí se cierra y resuelve `true`.
 *
 * Para confirmaciones con contenido propio (formularios, detalle de un pago)
 * seguí usando los modales dedicados (ConfirmDeleteModal, etc.).
 */
export const useDialogStore = create((set, get) => ({
    // { id, kind, title, message, tone, confirmLabel, cancelLabel, resolve, onConfirm, busy }
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
            // Si había otro dialog de confirmación abierto, se da por cancelado.
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

    /** Botón principal: confirma (y corre `onConfirm`, si hay) o cierra un alert. */
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
            // Si mientras tanto se abrió otro dialog (p. ej. un error), no se toca.
            if (get().current?.id === current.id) set({ current: null });
            current.resolve?.(true);
        }
    },

    /** Cierra el dialog; `result` es lo que recibe quien esperaba un confirm. */
    close: (result = false) => {
        const current = get().current;
        if (current?.busy) return; // no se puede cerrar mientras corre la acción
        current?.resolve?.(result);
        set({ current: null });
    },
}));
