import { create } from 'zustand';

let idSeq = 0;

/**
 * Dialog de acknowledgement global (un solo botón "Entendido").
 * Cualquier parte de la app, incluso fuera de React, puede abrirlo:
 *   useDialogStore.getState().alert({ title, message, tone })
 *
 * Para confirmaciones (aceptar / cancelar) seguí usando los modales dedicados
 * (ConfirmDeleteModal, etc.); esto es solo para "algo salió mal, enterate".
 */
export const useDialogStore = create((set) => ({
    current: null, // { id, title, message, tone, confirmLabel }

    alert: ({ title = 'Error', message, tone = 'error', confirmLabel = 'Entendido' } = {}) => {
        idSeq += 1;
        set({ current: { id: idSeq, title, message, tone, confirmLabel } });
    },

    close: () => set({ current: null }),
}));
