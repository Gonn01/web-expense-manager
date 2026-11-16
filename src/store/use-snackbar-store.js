import { create } from 'zustand';

let idSeq = 0;

export const useSnackbarStore = create((set) => ({
    current: null,

    show: (message, type = 'success', icon) => {
        idSeq += 1;
        set({ current: { id: idSeq, message, type, icon } });
    },

    hide: () => set({ current: null }),
}));
