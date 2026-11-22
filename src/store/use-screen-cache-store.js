import { useCallback, useState } from 'react';
import { create } from 'zustand';
import useAuth from '@/store/use-auth-store';

const latestRequests = new Map();
let requestCounter = 0;

const hasEntry = (entries, key) => Object.hasOwn(entries, key);

export const useScreenCacheStore = create((set, get) => ({
    entries: {},

    write: (owner, key, value, fallback) => {
        if (owner !== useAuth.getState().token) return;
        const { entries } = get();
        const current = hasEntry(entries, key) ? entries[key] : fallback;
        const next = typeof value === 'function' ? value(current) : value;
        set({ entries: { ...get().entries, [key]: next } });
    },

    reset: () => {
        latestRequests.clear();
        set({ entries: {} });
    },
}));

useAuth.subscribe((state, previous) => {
    if (state.token !== previous.token) useScreenCacheStore.getState().reset();
});

export const hasScreenCache = (key) => hasEntry(useScreenCacheStore.getState().entries, key);

export function beginScreenRequest(key) {
    const request = ++requestCounter;
    latestRequests.set(key, request);
    return () => latestRequests.get(key) === request;
}

export function useCachedState(key, initial) {
    const owner = useAuth((s) => s.token);
    const [fallback] = useState(() => initial);
    const value = useScreenCacheStore((s) =>
        hasEntry(s.entries, key) ? s.entries[key] : fallback,
    );
    const cached = useScreenCacheStore((s) => hasEntry(s.entries, key));
    const write = useScreenCacheStore((s) => s.write);

    const setValue = useCallback(
        (next) => write(owner, key, next, fallback),
        [write, owner, key, fallback],
    );

    return [value, setValue, cached];
}
