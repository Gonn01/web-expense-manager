import { useState } from 'react';
import EntityCard from '@/pages/entidades_financieras/components/EntityCard';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import { t } from '@/i18n';

export default function EntitiesList({
    filtered,
    query,
    navigate,
    onDelete,
    onToggleFavorite,
    favoriteBusyIds,
    showEmpty,
    viewMode,
}) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    const openDelete = (entity) => {
        setSelected(entity);
        setModalOpen(true);
    };

    const confirmDelete = () => {
        if (selected) onDelete(selected);
        setModalOpen(false);
        setSelected(null);
    };

    const containerClass =
        viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'
            : 'flex flex-col gap-4';

    return (
        <>
            <div className={containerClass}>
                {filtered.map((e) => (
                    <EntityCard
                        key={e.id}
                        entity={e}
                        onClick={() => navigate(`/app/entidades/${e.id}`)}
                        onDelete={openDelete}
                        onToggleFavorite={onToggleFavorite}
                        favoriteBusy={Boolean(favoriteBusyIds?.has(e.id))}
                    />
                ))}

                {filtered.length === 0 && !showEmpty && (
                    <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-8">
                        {t('entity.notFoundQuery', { query })}
                    </div>
                )}
            </div>

            <ConfirmDeleteModal
                open={modalOpen}
                title={t('common.deleteEntity')}
                message={t('entity.confirmDelete', { name: selected?.name })}
                confirmLabel={t('common.deleteEntity')}
                onCancel={() => setModalOpen(false)}
                onConfirm={confirmDelete}
            />
        </>
    );
}
