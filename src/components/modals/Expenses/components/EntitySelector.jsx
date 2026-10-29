import Icon from '@/components/Icon';
import Select from '@/components/Select';

export default function EntitySelector({
    entity,
    setEntity,
    entities,
    showNewEntity,
    setShowNewEntity,
    newEntityName,
    setNewEntityName,
    newEntityEmail,
    setNewEntityEmail,
    handleCreateEntity,
    loading,
    loadingNewEntity,
}) {
    return (
        <div className="space-y-2">
            <label className="text-slate-900 dark:text-white text-sm font-medium">
                Entidad financiera
            </label>

            <div className="relative">
                {loading ? (
                    <div className="h-12 w-full rounded-lg bg-slate-50 dark:bg-[#1c2620] border border-slate-300 dark:border-[#3d5245] animate-pulse flex items-center px-3">
                        <div className="h-4 w-32 bg-slate-100 dark:bg-[#29382f] rounded" />
                    </div>
                ) : entities.length === 0 ? (
                    <div className="h-12 w-full rounded-lg border border-slate-300 dark:border-[#3d5245] bg-slate-50 dark:bg-[#1c2620] px-3 flex items-center gap-2 text-slate-500 dark:text-[#9eb7a8] text-sm">
                        <Icon name="info" className="text-base" />
                        No tenés entidades creadas aún
                    </div>
                ) : (
                    <div className="relative">
                        <Select
                            className="h-12 w-full rounded-lg border border-slate-300 dark:border-[#3d5245] bg-slate-50 dark:bg-[#1c2620] px-3 text-slate-900 dark:text-white cursor-pointer"
                            value={entity}
                            onChange={setEntity}
                            placeholder="Seleccionar..."
                            aria-label="Entidad financiera"
                            options={entities.map((e) => ({
                                value: e.id,
                                label: e.is_favorite ? `★ ${e.name}` : e.name,
                            }))}
                        />
                    </div>
                )}
            </div>

            {!showNewEntity && (
                <button
                    disabled={loading}
                    onClick={() => setShowNewEntity(true)}
                    className="
                    text-primary text-sm mt-2 flex items-center gap-1
                    hover:underline disabled:opacity-50
                "
                >
                    {loading && <Icon name="progress_activity" className="animate-spin text-xs" />}+
                    Crear nueva entidad
                </button>
            )}

            {showNewEntity && (
                <div className="mt-3 p-3 border border-slate-200 dark:border-[#29382f] rounded-lg bg-slate-50 dark:bg-[#1c2620] space-y-3">
                    <input
                        disabled={loadingNewEntity}
                        className="h-11 w-full rounded-lg bg-white dark:bg-[#111714] border border-slate-300 dark:border-[#3d5245]
               text-slate-900 dark:text-white px-3 disabled:opacity-60"
                        placeholder="Nombre de la nueva entidad"
                        value={newEntityName}
                        onChange={(e) => setNewEntityName(e.target.value)}
                        autoFocus
                    />

                    <input
                        type="email"
                        disabled={loadingNewEntity}
                        className="h-11 w-full rounded-lg bg-white dark:bg-[#111714] border border-slate-300 dark:border-[#3d5245]
               text-slate-900 dark:text-white px-3 disabled:opacity-60"
                        placeholder="Vincular a un usuario (opcional)"
                        value={newEntityEmail}
                        onChange={(e) => setNewEntityEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateEntity()}
                    />

                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => {
                                setShowNewEntity(false);
                                setNewEntityEmail('');
                            }}
                            disabled={loadingNewEntity}
                            className={`text-sm px-3 py-1.5 rounded-lg
                            ${loadingNewEntity ? 'bg-slate-100/60 dark:bg-[#29382f]/60 cursor-not-allowed text-slate-400 dark:text-white/50' : 'bg-slate-100 dark:bg-[#29382f] text-slate-900 dark:text-white cursor-pointer'}`}
                        >
                            Cancelar
                        </button>

                        <button
                            onClick={handleCreateEntity}
                            disabled={loadingNewEntity}
                            className={`text-sm px-3 py-1.5 rounded-lg flex items-center gap-2
                                ${loadingNewEntity ? 'bg-primary/60 cursor-not-allowed text-black' : 'bg-primary text-black cursor-pointer'}`}
                        >
                            {loadingNewEntity ? (
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
