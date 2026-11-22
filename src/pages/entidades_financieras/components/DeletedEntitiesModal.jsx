import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/Icon';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import { t } from '@/i18n';

export default function DeletedEntitiesModal({ isOpen, deletedEntities = [], onClose, onRestore }) {
    const [selected, setSelected] = useState(null);
    const [restoringId, setRestoringId] = useState(null);

    useEffect(() => {
        if (!isOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => e.key === 'Escape' && restoringId === null && onClose?.();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen, onClose, restoringId]);

    const confirmRestore = async () => {
        if (!selected) return;
        setRestoringId(selected.id);
        try {
            await onRestore?.(selected.id);
        } catch (err) {
            console.error('Error restoring entity:', err);
        } finally {
            setRestoringId(null);
            setSelected(null);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <>
            <div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onMouseDown={onClose}
            />

            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8"
                aria-modal="true"
                role="dialog"
                aria-labelledby="deleted-entities-title"
                onMouseDown={(e) => e.target === e.currentTarget && onClose()}
            >
                <div className="relative flex flex-col w-full max-w-lg max-h-full overflow-y-auto bg-white dark:bg-[#18211b] rounded-xl border border-slate-300 dark:border-[#3d5245] shadow-xl">
                    <div className="flex items-start justify-between gap-3 p-4 sm:p-6">
                        <div className="flex flex-col gap-1">
                            <h2
                                id="deleted-entities-title"
                                className="text-slate-900 dark:text-white text-xl font-bold tracking-tight"
                            >
                                {t('entidadesFinancieras.deletedEntities')}
                            </h2>
                            <p className="text-slate-500 dark:text-[#9eb7a8] text-sm">
                                {t('entidadesFinancieras.restoreAnEntityToBringItBack')}
                            </p>
                        </div>
                        <button
                            type="button"
                            className="text-slate-500 dark:text-[#9eb7a8] transition-colors duration-200 hover:text-slate-900 dark:hover:text-white"
                            onClick={onClose}
                            aria-label={t('common.close')}
                        >
                            <Icon name="close" />
                        </button>
                    </div>

                    <div className="flex-1 px-6 pb-6 max-h-[60vh] overflow-y-auto">
                        {deletedEntities.length === 0 ? (
                            <p className="text-slate-500 dark:text-[#9eb7a8] text-sm text-center py-6">
                                {t('entidadesFinancieras.youHaveNoDeletedEntities')}
                            </p>
                        ) : (
                            <ul className="flex flex-col gap-2">
                                {deletedEntities.map((entity) => (
                                    <li
                                        key={entity.id}
                                        className="flex items-center justify-between gap-3 rounded-lg border border-slate-300 dark:border-[#3d5245] bg-slate-50 dark:bg-[#1c2620] px-4 py-3"
                                    >
                                        <span className="text-slate-900 dark:text-white text-sm font-medium truncate">
                                            {entity.name}
                                        </span>
                                        <button
                                            type="button"
                                            disabled={
                                                restoringId === entity.id || restoringId !== null
                                            }
                                            onClick={() => setSelected(entity)}
                                            className="flex items-center justify-center gap-2 shrink-0 rounded-lg h-9 px-3 bg-primary text-[#111714] text-sm font-bold tracking-wide transition-opacity duration-200 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Icon name="restore" className="text-base" />
                                            <span className="truncate">{t('common.restore')}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 p-6 bg-slate-50/60 dark:bg-[#1c2620]/60 border-t border-slate-300 dark:border-[#3d5245]">
                        <button
                            type="button"
                            className="flex w-full sm:w-auto min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-5 bg-slate-100 dark:bg-[#29382f] text-slate-900 dark:text-white text-sm font-bold tracking-wide transition-colors duration-200 hover:bg-slate-200 dark:hover:bg-[#34453a]"
                            onClick={onClose}
                        >
                            <span className="truncate">{t('common.close')}</span>
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmDeleteModal
                open={!!selected}
                title={t('entidadesFinancieras.restoreEntity')}
                message={t('entity.confirmRestore', { name: selected?.name })}
                confirmLabel={t('common.confirm')}
                tone="primary"
                loading={restoringId !== null}
                onCancel={() => setSelected(null)}
                onConfirm={confirmRestore}
            />
        </>,
        document.body,
    );
}
