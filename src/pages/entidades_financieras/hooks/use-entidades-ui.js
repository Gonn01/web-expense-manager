import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntidadesData } from './use-entidades-data';
import { useUIStore } from '@/store/use-ui-store';
import { useDialogStore } from '@/store/use-dialog-store';
import { t } from '@/i18n';

export function useEntidadesUI() {
    const navigate = useNavigate();
    const {
        entities,
        deletedEntities,
        loading,
        crearEntidad,
        eliminarEntidad,
        restaurarEntidad,
        toggleFavorito,
    } = useEntidadesData();
    const [favoriteBusyIds, setFavoriteBusyIds] = useState(() => new Set());

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

        return result.sort(
            (a, b) =>
                Number(Boolean(b.is_favorite)) - Number(Boolean(a.is_favorite)) ||
                (b.cantidad ?? 0) - (a.cantidad ?? 0),
        );
    }, [query, entities]);

    const showEmpty = !loading && entities.length === 0 && filtered.length === 0;

    async function handleSaveNew({ name, email }) {
        try {
            const { linkError } = await crearEntidad({ name, email });
            setOpenNew(false);
            navigate('/app/entidades');

            if (linkError) {
                console.error('Error vinculando usuario:', linkError);
                useDialogStore.getState().alert({
                    title: t('common.entityCreated'),
                    tone: 'warning',
                    message: t('entity.createdLinkFailed', {
                        reason: linkError.message ?? t('common.checkTheEmail'),
                    }),
                });
            }
        } catch (err) {
            console.error('Error creating entity:', err);
        }
    }

    async function handleDelete(entity) {
        try {
            await eliminarEntidad(entity.id);
        } catch (err) {
            console.error('Error deleting entity:', err);
        }
    }

    async function handleToggleFavorite(entity) {
        setFavoriteBusyIds((prev) => new Set(prev).add(entity.id));
        try {
            await toggleFavorito(entity);
        } catch (err) {
            console.error('Error marking entity as favorite:', err);
        } finally {
            setFavoriteBusyIds((prev) => {
                const next = new Set(prev);
                next.delete(entity.id);
                return next;
            });
        }
    }

    return {
        favoriteBusyIds,
        handleToggleFavorite,
        query,
        setQuery,
        openNew,
        setOpenNew,
        showDeletedModal,
        setShowDeletedModal,
        viewMode,
        setViewMode,
        filtered,
        deletedEntities,
        showEmpty,
        loading,

        handleSaveNew,
        handleDelete,
        restaurarEntidad,

        navigate,
    };
}
