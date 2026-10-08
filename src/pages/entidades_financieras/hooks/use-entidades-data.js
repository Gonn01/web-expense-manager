import { useCallback, useEffect, useState } from 'react';
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
    const [entities, setEntities] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addEntity } = useEntitiesStore();

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

            setEntities(normalized);
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

        setEntities((prev) => [finalEntity, ...prev]);
        addEntity(finalEntity);

        return { entity: finalEntity, linkError };
    }

    async function eliminarEntidad(id) {
        await deleteFinancialEntity(id, token);
        setEntities((prev) => prev.filter((e) => e.id !== id));
    }

    async function restaurarEntidad(id) {
        await restoreEntity(id, token);
        await loadEntities();
    }

    return {
        entities,
        loading,
        crearEntidad,
        eliminarEntidad,
        restaurarEntidad,
        setEntities,
    };
}
