import { useState, useEffect } from 'react';
import Icon from '@/components/Icon';
import { useEntitiesStore } from '@/store/use-entities-store';
import useAuth from '@/store/use-auth-store';

export default function AprobarModal({ open, gasto, onClose, onConfirm, loading }) {
    const { token } = useAuth();
    const { entities, loadEntities } = useEntitiesStore();

    const [mode, setMode] = useState('existing');
    const [selectedEntityId, setSelectedEntityId] = useState('');
    const [newEntityName, setNewEntityName] = useState('');

    useEffect(() => {
        if (!open) return;
        // Solo se recarga si la entidad sugerida no esta en el store (p. ej.
        // creada desde otro dispositivo).
        const suggestedId = gasto?.suggested_entity_id;
        if (suggestedId && !useEntitiesStore.getState().getEntityById(suggestedId)) {
            loadEntities(token);
        }
        setNewEntityName('');
        setSelectedEntityId(gasto?.suggested_entity_id?.toString() || '');
        setMode('existing');
    }, [open, gasto?.suggested_entity_id, loadEntities, token]);

    if (!open) return null;

    const hasEntities = entities.length > 0;

    const canConfirm =
        !loading && (mode === 'existing' ? !!selectedEntityId : newEntityName.trim().length > 0);

    const handleConfirm = () => {
        if (mode === 'existing') {
            onConfirm(Number(selectedEntityId), null);
        } else {
            onConfirm(null, newEntityName.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
                className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold mb-1 dark:text-white flex items-center gap-2">
                    <Icon name="check_circle" className="text-green-500" />
                    Aprobar gasto compartido
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
                    <span className="font-medium dark:text-white">{gasto?.name}</span>
                    {' · '}
                    {gasto?.currency_type} {Number(gasto?.amount).toLocaleString('es-AR')}
                </p>

                {/* TABS MODO */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setMode('existing')}
                        className={`flex-1 py-2 text-sm rounded-lg font-medium border transition-colors ${mode === 'existing'
                                ? 'bg-primary text-white border-primary'
                                : 'border-zinc-300 dark:border-zinc-700 dark:text-white'
                            }`}
                    >
                        Entidad existente
                    </button>
                    <button
                        onClick={() => setMode('new')}
                        className={`flex-1 py-2 text-sm rounded-lg font-medium border transition-colors ${mode === 'new'
                                ? 'bg-primary text-white border-primary'
                                : 'border-zinc-300 dark:border-zinc-700 dark:text-white'
                            }`}
                    >
                        Crear nueva
                    </button>
                </div>

                {mode === 'existing' && (
                    <div>
                        {hasEntities ? (
                            <select
                                value={selectedEntityId}
                                onChange={(e) => setSelectedEntityId(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white text-sm"
                            >
                                <option value="">Seleccioná una entidad</option>
                                {entities.map((e) => (
                                    <option key={e.id} value={e.id}>
                                        {e.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                No tenés entidades. Creá una nueva.
                            </p>
                        )}
                    </div>
                )}

                {mode === 'new' && (
                    <div>
                        <input
                            type="text"
                            placeholder={`Ej: ${gasto?.sender_name || 'Nombre de entidad'}`}
                            value={newEntityName}
                            onChange={(e) => setNewEntityName(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border dark:border-zinc-700 bg-transparent dark:text-white text-sm"
                        />
                    </div>
                )}

                <div className="flex justify-between mt-6">
                    <button
                        disabled={loading}
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-white text-sm"
                    >
                        Cancelar
                    </button>
                    <button
                        disabled={!canConfirm}
                        onClick={handleConfirm}
                        className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <Icon name="progress_activity" className="animate-spin text-sm" />
                        ) : (
                            <Icon name="check" className="text-sm" />
                        )}
                        Aprobar
                    </button>
                </div>
            </div>
        </div>
    );
}
