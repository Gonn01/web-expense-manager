import { create } from 'zustand';

const storageKey = (userId) => `onboarding:seen:${userId}`;

export function hasSeenOnboarding(userId) {
    if (userId == null) return true;
    try {
        return localStorage.getItem(storageKey(userId)) === '1';
    } catch {
        return true;
    }
}

function markOnboardingSeen(userId) {
    if (userId == null) return;
    try {
        localStorage.setItem(storageKey(userId), '1');
    } catch {}
}

export const useOnboardingStore = create((set, get) => ({
    open: false,
    userId: null,

    openOnboarding: (userId) => set({ open: true, userId }),

    closeOnboarding: () => {
        markOnboardingSeen(get().userId);
        set({ open: false, userId: null });
    },
}));
