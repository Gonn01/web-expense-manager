import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../Icon';

export default function NewEntityModal({ open, onClose, onSave }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === 'Escape' && onClose?.();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    const canSave = useMemo(() => name.trim().length > 0, [name]);

    const handleSave = async () => {
        if (!canSave || saving) return;
        setSaving(true);
        try {
            await onSave?.({ name: name.trim(), email: email.trim() || undefined });
            setName('');
            setEmail('');
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

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
                aria-labelledby="new-entity-title"
                onMouseDown={(e) => e.target === e.currentTarget && onClose()}
            >
                <div className="relative flex flex-col w-full max-w-lg max-h-full overflow-y-auto bg-white dark:bg-[#18211b] rounded-xl border border-slate-300 dark:border-[#3d5245] shadow-xl">
                    <div className="flex items-start justify-between gap-3 p-4 sm:p-6">
                        <div className="flex flex-col gap-1">
                            <h2
                                id="new-entity-title"
                                className="text-slate-900 dark:text-white text-xl font-bold tracking-tight"
                            >
                                Crear Nueva Entidad
                            </h2>
                            <p className="text-slate-500 dark:text-[#9eb7a8] text-sm">
                                Añade un nuevo banco, persona o servicio.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="text-slate-500 dark:text-[#9eb7a8] transition-colors duration-200 hover:text-slate-900 dark:hover:text-white"
                            onClick={onClose}
                            aria-label="Cerrar"
                        >
                            <Icon name="close" />
                        </button>
                    </div>

                    <div className="flex-1 px-6 pb-6">
                        <div className="flex flex-col gap-4">
                            <label className="flex flex-col w-full">
                                <p className="text-slate-900 dark:text-white text-sm font-medium pb-2">
                                    Nombre de la entidad
                                </p>
                                <input
                                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white border border-slate-300 dark:border-[#3d5245] bg-slate-50 dark:bg-[#1c2620] h-12 placeholder:text-slate-400 dark:placeholder:text-[#9eb7a8] px-4 py-3 text-base font-normal"
                                    placeholder="Ej: Banco Galicia, Juan Pérez, etc."
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    autoFocus
                                />
                            </label>

                            <label className="flex flex-col w-full">
                                <p className="text-slate-900 dark:text-white text-sm font-medium pb-2">
                                    Vincular a un usuario (opcional)
                                </p>
                                <input
                                    type="email"
                                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white border border-slate-300 dark:border-[#3d5245] bg-slate-50 dark:bg-[#1c2620] h-12 placeholder:text-slate-400 dark:placeholder:text-[#9eb7a8] px-4 py-3 text-base font-normal"
                                    placeholder="Ej: juan@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 p-6 bg-slate-50/60 dark:bg-[#1c2620]/60 border-t border-slate-300 dark:border-[#3d5245]">
                        <button
                            type="button"
                            disabled={saving}
                            className="flex w-full sm:w-auto min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-5 bg-slate-100 dark:bg-[#29382f] text-slate-900 dark:text-white text-sm font-bold tracking-wide transition-colors duration-200 hover:bg-slate-200 dark:hover:bg-[#34453a] disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={onClose}
                        >
                            <span className="truncate">Cancelar</span>
                        </button>
                        <button
                            type="button"
                            disabled={!canSave || saving}
                            className="flex w-full sm:w-auto min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-11 px-5 bg-primary text-[#111714] text-sm font-bold tracking-wide transition-opacity duration-200 hover:opacity-80 disabled:opacity-60 disabled:cursor-not-allowed"
                            onClick={handleSave}
                        >
                            {saving && (
                                <span className="w-4 h-4 border-2 border-[#111714]/30 border-t-[#111714] rounded-full animate-spin shrink-0" />
                            )}
                            <span className="truncate">
                                {saving ? 'Guardando...' : 'Guardar Entidad'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </>,
        document.body,
    );
}
