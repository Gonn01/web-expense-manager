import { create } from 'zustand';
import {
    fetchNotificaciones,
    marcarNotificacionLeida,
    marcarNotificacionesLeidas,
} from '@/services/api';
import { mergeFirstPage } from '@/utils/notifications';

const INITIAL_STATE = {
    items: [],
    unreadCount: 0,
    nextBefore: null,
    loading: false,
    loadingMore: false,
};

let latestRequest = 0;

export const useNotificacionesStore = create((set, get) => ({
    ...INITIAL_STATE,

    reset: () => {
        latestRequest += 1;
        set(INITIAL_STATE);
    },

    load: async (token) => {
        if (!token) return;
        const request = ++latestRequest;
        set((state) => ({ loading: state.items.length === 0 }));
        try {
            const page = await fetchNotificaciones({}, token);
            if (request !== latestRequest) return;
            const { items, nextBefore } = mergeFirstPage(get().items, get().nextBefore, page);
            set({ items, nextBefore, unreadCount: page.unread_count, loading: false });
        } catch (err) {
            console.error('Error cargando notificaciones', err);
            if (request === latestRequest) set({ loading: false });
        }
    },

    loadMore: async (token) => {
        const { nextBefore, loadingMore } = get();
        if (!token || !nextBefore || loadingMore) return;
        const request = latestRequest;
        set({ loadingMore: true });
        try {
            const page = await fetchNotificaciones({ before: nextBefore }, token);
            if (request !== latestRequest) return;
            set((state) => ({
                items: [
                    ...state.items,
                    ...page.items.filter(
                        (item) => !state.items.some((current) => current.id === item.id),
                    ),
                ],
                nextBefore: page.next_before,
                unreadCount: page.unread_count,
            }));
        } catch (err) {
            console.error('Error cargando más notificaciones', err);
        } finally {
            set({ loadingMore: false });
        }
    },

    markRead: async (id, token) => {
        const target = get().items.find((item) => item.id === id);
        if (!token || !target || target.read_at) return;
        const { unread_count: unreadCount } = await marcarNotificacionLeida(id, token);
        const readAt = new Date().toISOString();
        set((state) => ({
            unreadCount,
            items: state.items.map((item) =>
                item.id === id ? { ...item, read_at: readAt } : item,
            ),
        }));
    },

    markAllRead: async (token) => {
        if (!token) return;
        await marcarNotificacionesLeidas(token);
        const readAt = new Date().toISOString();
        set((state) => ({
            unreadCount: 0,
            items: state.items.map((item) => ({ ...item, read_at: item.read_at ?? readAt })),
        }));
    },
}));
