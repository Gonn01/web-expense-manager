import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    fetchFinancialEntities,
    createEntity,
    deleteFinancialEntity,
    restoreEntity,
    vincularUsuarioEntidad,
} from '@/services/api';
import useAuth from '@/store/use-auth-store';
import { useEntitiesStore } from '@/store/use-entities-store';

export function useEntidadesData() {
    const { token } = useAuth();
    // Todas las entidades (activas y eliminadas): el endpoint las trae juntas
    // con el campo `deleted` y se separan acá.
    const [allEntities, setAllEntities] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addEntity, removeEntity } = useEntitiesStore();

    const entities = useMemo(() => allEntities.filter((e) => !e.deleted), [allEntities]);
    const deletedEntities = useMemo(() => allEntities.filter((e) => e.deleted), [allEntities]);

    const loadEntities = useCallback(async () => {
        try {
            setLoading(true);

            const data = await fetchFinancialEntities(token);

            const normalized = data.map((e) => ({
                ...e,
                balances: e.balances ?? [{ currency: 'ARS', amount: 0 }],
                activeExpenses: e.activeExpenses ?? 0,
                type: e.type ?? 'bank',
            }));

            setAllEntities(normalized);
        } catch (err) {
            console.error('Error fetching entities:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!token) return;
        loadEntities();
    }, [token, loadEntities]);
    async function crearEntidad({ name, email }) {
        const created = await createEntity({ name }, token);

        let finalEntity = created;
        let linkError = null;

        if (email) {
            try {
                finalEntity = await vincularUsuarioEntidad(created.id, email, token);
            } catch (err) {
                linkError = err;
            }
        }

        setAllEntities((prev) => [finalEntity, ...prev]);
        addEntity(finalEntity);

        return { entity: finalEntity, linkError };
    }

    async function eliminarEntidad(id) {
        await deleteFinancialEntity(id, token);
        setAllEntities((prev) => prev.map((e) => (e.id === id ? { ...e, deleted: true } : e)));
        removeEntity(id);
    }

    async function restaurarEntidad(id) {
        await restoreEntity(id, token);
        const restored = allEntities.find((e) => e.id === id);
        setAllEntities((prev) => prev.map((e) => (e.id === id ? { ...e, deleted: false } : e)));
        if (restored) addEntity({ ...restored, deleted: false });
    }

    return {
        entities,
        deletedEntities,
        loading,
        crearEntidad,
        eliminarEntidad,
        restaurarEntidad,
    };
}
