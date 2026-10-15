import { create } from 'zustand';
import { fetchFinancialEntities, createEntity as apiCreateEntity } from '@/services/api';

export const useEntitiesStore = create((set, get) => ({
    entities: [],
    loading: false,

    loadEntities: async (token) => {
        set({ loading: true });
        try {
            const data = await fetchFinancialEntities(token);
            // El endpoint trae también las eliminadas; acá solo van las activas.
            set({ entities: data.filter((e) => !e.deleted) });
        } catch (err) {
            console.error('Error loading entities', err);
        } finally {
            set({ loading: false });
        }
    },

    createEntity: async (name, token) => {
        const created = await apiCreateEntity({ name }, token);
        set((state) => ({ entities: [...state.entities, created] }));
        return created;
    },

    getEntityById: (id) => {
        return get().entities.find((e) => e.id == id) || null;
    },

    addEntity: (entity) => {
        set((state) => ({
            entities: [...state.entities, entity],
        }));
    },

    updateEntity: (id, patch) => {
        set((state) => ({
            entities: state.entities.map((e) => (e.id == id ? { ...e, ...patch } : e)),
        }));
    },

    removeEntity: (id) => {
        set((state) => ({
            entities: state.entities.filter((e) => e.id != id),
        }));
    },
}));
