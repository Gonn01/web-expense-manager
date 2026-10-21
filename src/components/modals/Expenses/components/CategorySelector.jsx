import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/Icon';

export default function CategorySelector({ categories, selectedIds, onToggle, onCreate, loading }) {
    const [open, setOpen] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [creating, setCreating] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        setCreating(true);
        try {
            await onCreate(newName.trim());
            setNewName('');
            setShowForm(false);
        } finally {
            setCreating(false);
        }
    };

    const selected = categories.filter((c) => selectedIds.includes(c.id));

    return (
        <div className="space-y-2">
            <label className="text-white text-sm font-medium">Categorías (opcional)</label>

            <div className="relative" ref={dropdownRef}>
                {loading ? (
                    <div className="h-12 w-full rounded-lg bg-[#1c2620] border border-[#3d5245] animate-pulse flex items-center px-3">
                        <div className="h-4 w-32 bg-[#29382f] rounded" />
                    </div>
                ) : categories.length === 0 ? (
                    <div className="h-12 w-full rounded-lg border border-[#3d5245] bg-[#1c2620] px-3 flex items-center gap-2 text-[#9eb7a8] text-sm">
                        <Icon name="info" className="text-base" />
                        No tenés categorías creadas aún
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        className="w-full min-h-12 rounded-lg border border-[#3d5245] bg-[#1c2620]
                            px-3 pr-10 text-left flex flex-wrap gap-1.5 items-center py-2
                            outline-none focus:outline-none focus-visible:outline-none relative cursor-pointer"
                    >
                        {selected.length === 0 ? (
                            <span className="text-[#9eb7a8] text-sm">
                                Seleccionar categorías...
                            </span>
                        ) : (
                            selected.map((c) => (
                                <span
                                    key={c.id}
                                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary text-black"
                                >
                                    {c.name}
                                    <span
                                        role="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggle(c.id);
                                        }}
                                        className="flex items-center justify-center hover:opacity-70 cursor-pointer"
                                    >
                                        <Icon
                                            name="close"
                                            className="block"
                                            style={{ fontSize: 12, lineHeight: 1 }}
                                        />
                                    </span>
                                </span>
                            ))
                        )}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9eb7a8] pointer-events-none">
                            <Icon name={open ? 'expand_less' : 'expand_more'} />
                        </div>
                    </button>
                )}

                {open && categories.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full rounded-lg border border-[#3d5245] bg-[#1c2620] shadow-xl overflow-hidden">
                        <ul className="max-h-48 overflow-y-auto py-1">
                            {categories.map((c) => {
                                const isSelected = selectedIds.includes(c.id);
                                return (
                                    <li
                                        key={c.id}
                                        onClick={() => onToggle(c.id)}
                                        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-[#29382f] transition-colors"
                                    >
                                        <div
                                            className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0
                                            ${isSelected ? 'bg-primary border-primary' : 'border-[#3d5245]'}`}
                                        >
                                            {isSelected && (
                                                <Icon
                                                    name="check"
                                                    className="block text-black"
                                                    style={{ fontSize: 12, lineHeight: 1 }}
                                                />
                                            )}
                                        </div>
                                        <div
                                            className="w-2.5 h-2.5 rounded-full shrink-0"
                                            style={{ backgroundColor: c.color ?? '#52b788' }}
                                        />
                                        <span className="text-sm text-white">{c.name}</span>
                                    </li>
                                );
                            })}
                        </ul>

                        {selected.length > 0 && (
                            <div className="border-t border-[#29382f] px-3 py-2 flex justify-between items-center">
                                <span className="text-xs text-[#9eb7a8]">
                                    {selected.length} seleccionada{selected.length !== 1 ? 's' : ''}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="text-xs text-primary hover:opacity-80 cursor-pointer"
                                >
                                    Aceptar
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {!showForm ? (
                <button
                    type="button"
                    disabled={loading}
                    onClick={() => setShowForm(true)}
                    className="text-primary text-sm mt-1 flex items-center gap-1 hover:underline disabled:opacity-50"
                >
                    {loading && <Icon name="progress_activity" className="animate-spin text-xs" />}+
                    Crear nueva categoría
                </button>
            ) : (
                <div className="mt-2 p-3 border border-[#29382f] rounded-lg bg-[#1c2620] space-y-3">
                    <input
                        disabled={creating}
                        className="h-11 w-full rounded-lg bg-[#111714] border border-[#3d5245] text-white px-3 disabled:opacity-60"
                        placeholder="Nombre de la categoría"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            disabled={creating}
                            onClick={() => {
                                setShowForm(false);
                                setNewName('');
                            }}
                            className={`text-sm px-3 py-1.5 rounded-lg
                                ${creating ? 'bg-[#29382f]/60 cursor-not-allowed text-white/50' : 'bg-[#29382f] text-white cursor-pointer'}`}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            disabled={creating || !newName.trim()}
                            onClick={handleCreate}
                            className={`text-sm px-3 py-1.5 rounded-lg flex items-center gap-2
                                ${creating ? 'bg-primary/60 cursor-not-allowed text-black' : 'bg-primary text-black cursor-pointer'}`}
                        >
                            {creating ? (
                                <>
                                    <Icon name="progress_activity" className="animate-spin" />
                                    Creando...
                                </>
                            ) : (
                                'Crear'
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
