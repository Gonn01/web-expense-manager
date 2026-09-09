import { useState, useEffect, useMemo } from 'react';
import Icon from '@/components/Icon';

export default function EditEntityModal({ open, entity, onClose, onSave, saving = false }) {
    const initialName = entity?.name || '';
    const [name, setName] = useState(initialName);
    const [nameError, setNameError] = useState('');

    useEffect(() => {
        setName(entity?.name || '');
        setNameError('');
    }, [entity]);

    const handleSaveName = async () => {
        setNameError('');
        try {
            await onSave(name.trim());
        } catch (err) {
            setNameError(err?.message || 'No se pudo actualizar la entidad.');
        }
    };

    const canSave = useMemo(() => {
        if (saving) return false;
        if (!name.trim()) return false;
        if (name.trim() === initialName.trim()) return false;
        return true;
    }, [name, initialName, saving]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md p-6 overflow-hidden">
                {/* OVERLAY LOADER */}
                {saving && (
                    <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                        <Icon
                            name="progress_activity"
                            className="animate-spin text-primary text-4xl"
                        />
                        <p className="text-sm font-medium text-white">Guardando cambios…</p>
                    </div>
                )}

                {/* HEADER */}
                <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                    <Icon name="edit" />
                    Editar Entidad
                </h2>

                {/* NOMBRE */}
                <div className="mb-6">
                    <label className="text-sm text-zinc-600 dark:text-zinc-300">Nombre</label>
                    <input
                        type="text"
                        value={name}
                        disabled={saving}
                        onChange={(e) => {
                            setName(e.target.value);
                            setNameError('');
                        }}
                        className="w-full mt-1 px-3 py-2 rounded-lg border dark:border-zinc-700 bg-transparent dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
                </div>

                {/* FOOTER */}
                <div className="flex justify-between mt-2">
                    <button
                        disabled={saving}
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancelar
                    </button>
                    <button
                        disabled={!canSave}
                        onClick={handleSaveName}
                        className="px-4 py-2 rounded-lg bg-primary text-white flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}
