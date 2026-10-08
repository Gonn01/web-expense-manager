import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntidadesData } from './use-entidades-data';
import { useUIStore } from '@/store/use-ui-store';
import { useDialogStore } from '@/store/use-dialog-store';

export function useEntidadesUI() {
    const navigate = useNavigate();
    const { entities, loading, crearEntidad, eliminarEntidad, restaurarEntidad } = useEntidadesData();

    const [query, setQuery] = useState('');
    const [openNew, setOpenNew] = useState(false);
    const [showDeletedModal, setShowDeletedModal] = useState(false);
    const viewMode = useUIStore((s) => s.entitiesViewMode);
    const setViewMode = useUIStore((s) => s.setEntitiesViewMode);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        const result = q
            ? entities.filter((e) => (e.name || '').toLowerCase().includes(q))
            : [...entities];

        return result.sort((a, b) => (b.activeExpenses ?? 0) - (a.activeExpenses ?? 0));
    }, [query, entities]);

    // const showEmpty = entities.length === 0 && filtered.length === 0;
    const showEmpty = !loading && entities.length === 0 && filtered.length === 0;

    async function handleSaveNew({ name, email }) {
        try {
            const { linkError } = await crearEntidad({ name, email });
            setOpenNew(false);
            navigate('/app/entidades');

            if (linkError) {
                // Éxito parcial: la entidad quedó creada pero el vínculo falló.
                console.error('Error vinculando usuario:', linkError);
                useDialogStore.getState().alert({
                    title: 'Entidad creada',
                    tone: 'warning',
                    message: `Se creó la entidad, pero no se pudo vincular el usuario: ${
                        linkError.message ?? 'revisá el email.'
                    }`,
                });
            }
        } catch (err) {
            // El interceptor de axios ya mostró el error.
            console.error('Error creating entity:', err);
        }
    }

    async function handleDelete(entity) {
        try {
            await eliminarEntidad(entity.id);
        } catch (err) {
            // El interceptor de axios ya mostró el error.
            console.error('Error deleting entity:', err);
        }
    }

    return {
        query,
        setQuery,
        openNew,
        setOpenNew,
        showDeletedModal,
        setShowDeletedModal,
        viewMode,
        setViewMode,
        filtered,
        showEmpty,
        loading,

        handleSaveNew,
        handleDelete,
        restaurarEntidad,

        navigate,
    };
}
