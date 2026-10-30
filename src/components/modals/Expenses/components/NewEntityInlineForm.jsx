import Icon from '@/components/Icon';

const inputClass =
    'h-11 w-full rounded-lg bg-white dark:bg-[#111714] border border-slate-300 dark:border-[#3d5245] text-slate-900 dark:text-white px-3 disabled:opacity-60';

export default function NewEntityInlineForm({
    name,
    setName,
    email,
    setEmail,
    loading,
    onCancel,
    onCreate,
}) {
    const onEnter = (e) => e.key === 'Enter' && onCreate();

    return (
        <div className="mt-3 p-3 border border-slate-200 dark:border-[#29382f] rounded-lg bg-slate-50 dark:bg-[#1c2620] space-y-3">
            <input
                disabled={loading}
                className={inputClass}
                placeholder="Ej: Banco Galicia"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={setEmail ? undefined : onEnter}
                autoFocus
            />

            {setEmail && (
                <input
                    type="email"
                    disabled={loading}
                    className={inputClass}
                    placeholder="Ej: juan@email.com (opcional)"
                    value={email ?? ''}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={onEnter}
                />
            )}

            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className={`text-sm px-3 py-1.5 rounded-lg
                    ${loading ? 'bg-slate-100/60 dark:bg-[#29382f]/60 cursor-not-allowed text-slate-400 dark:text-white/50' : 'bg-slate-100 dark:bg-[#29382f] text-slate-900 dark:text-white cursor-pointer'}`}
                >
                    Cancelar
                </button>

                <button
                    type="button"
                    onClick={onCreate}
                    disabled={loading}
                    className={`text-sm px-3 py-1.5 rounded-lg flex items-center gap-2
                        ${loading ? 'bg-primary/60 cursor-not-allowed text-black' : 'bg-primary text-black cursor-pointer'}`}
                >
                    {loading ? (
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
    );
}
