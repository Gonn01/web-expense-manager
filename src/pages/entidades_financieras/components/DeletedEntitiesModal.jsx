import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/Icon';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import { fetchDeletedEntities } from '@/services/api';
import useAuth from '@/store/use-auth-store';

export default function DeletedEntitiesModal({ isOpen, onClose, onRestore }) {
    const { token } = useAuth();
    const [deletedEntities, setDeletedEntities] = useState([]);
    const [loading, setLoading] = useState(false);
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
        const onKey = (e) => e.key === 'Escape' && onClose?.();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) return;

        const load = async () => {
            try {
                setLoading(true);
                const data = await fetchDeletedEntities(token);
                setDeletedEntities(data ?? []);
            } catch (err) {
                console.error('Error fetching deleted entities:', err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [isOpen, token]);

    const confirmRestore = async () => {
        if (!selected) return;
        setRestoringId(selected.id);
        try {
            await onRestore?.(selected.id);
        } finally {
            setDeletedEntities((prev) => prev.filter((e) => e.id !== selected.id));
            setRestoringId(null);
            setSelected(null);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onMouseDown={onClose}
            />

            {/* Modal */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8"
                aria-modal="true"
                role="dialog"
                aria-labelledby="deleted-entities-title"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="relative flex flex-col w-full max-w-lg overflow-hidden bg-[#18211b] rounded-xl border border-[#3d5245] shadow-xl">
                    {/* Header */}
                    <div className="flex items-start justify-between p-6">
                        <div className="flex flex-col gap-1">
                            <h2
                                id="deleted-entities-title"
                                className="text-white text-xl font-bold tracking-tight"
                            >
                                Entidades Eliminadas
                            </h2>
                            <p className="text-[#9eb7a8] text-sm">
                                Restaurá una entidad para que vuelva a tu listado.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="text-[#9eb7a8] transition-colors duration-200 hover:text-white"
                            onClick={onClose}
                            aria-label="Cerrar"
                        >
                            <Icon name="close" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 px-6 pb-6 max-h-[60vh] overflow-y-auto">
                        {loading ? (
                            <p className="text-[#9eb7a8] text-sm text-center py-6">Cargando...</p>
                        ) : deletedEntities.length === 0 ? (
                            <p className="text-[#9eb7a8] text-sm text-center py-6">
                                No tenés entidades eliminadas.
                            </p>
                        ) : (
                            <ul className="flex flex-col gap-2">
                                {deletedEntities.map((entity) => (
                                    <li
                                        key={entity.id}
                                        className="flex items-center justify-between gap-3 rounded-lg border border-[#3d5245] bg-[#1c2620] px-4 py-3"
                                    >
                                        <span className="text-white text-sm font-medium truncate">
                                            {entity.name}
                                        </span>
                                        <button
                                            type="button"
                                            disabled={restoringId === entity.id || restoringId !== null}
                                            onClick={() => setSelected(entity)}
                                            className="flex items-center justify-center gap-2 shrink-0 rounded-lg h-9 px-3 bg-primary text-[#111714] text-sm font-bold tracking-wide transition-opacity duration-200 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Icon name="restore" className="text-base" />
                                            <span className="truncate">Restaurar</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 p-6 bg-[#1c2620]/60 border-t border-[#3d5245]">
                        <button
                            type="button"
                            className="flex w-full sm:w-auto min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-5 bg-[#29382f] text-white text-sm font-bold tracking-wide transition-colors duration-200 hover:bg-[#34453a]"
                            onClick={onClose}
                        >
                            <span className="truncate">Cerrar</span>
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmDeleteModal
                open={!!selected}
                title="Restaurar entidad"
                message={`¿Seguro que querés restaurar "${selected?.name}"?`}
                confirmLabel="Confirmar"
                tone="primary"
                loading={restoringId !== null}
                loadingLabel="Restaurando..."
                onCancel={() => setSelected(null)}
                onConfirm={confirmRestore}
            />
        </>,
        document.body,
    );
}
