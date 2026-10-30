import Icon from '@/components/Icon';
import { FieldError } from '@/components/TextInput';
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
    error,
}) {
    const borderClass = error ? 'border-red-500' : 'border-[#3d5245]';

    return (
        <div className="space-y-2" data-field="entity">
            <label className="text-white text-sm font-medium">Entidad financiera</label>

            <div className="relative">
                {loading ? (
                    <div className="h-12 w-full rounded-lg bg-[#1c2620] border border-[#3d5245] animate-pulse flex items-center px-3">
                        <div className="h-4 w-32 bg-[#29382f] rounded" />
                    </div>
                ) : entities.length === 0 ? (
                    <div
                        className={`h-12 w-full rounded-lg border ${borderClass} bg-[#1c2620] px-3 flex items-center gap-2 text-[#9eb7a8] text-sm`}
                    >
                        <Icon name="info" className="text-base" />
                        No tenés entidades creadas aún
                    </div>
                ) : (
                    <div className="relative">
                        <Select
                            aria-invalid={error ? true : undefined}
                            className={`h-12 w-full rounded-lg border ${borderClass} bg-[#1c2620] px-3 text-white cursor-pointer`}
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

            {error && (
                <FieldError
                    message={entities.length === 0 ? `${error} Creá una nueva más abajo.` : error}
                />
            )}

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
                <div className="mt-3 p-3 border border-[#29382f] rounded-lg bg-[#1c2620] space-y-3">
                    <input
                        disabled={loadingNewEntity}
                        className="h-11 w-full rounded-lg bg-[#111714] border border-[#3d5245]
               text-white px-3 disabled:opacity-60"
                        placeholder="Nombre de la nueva entidad"
                        value={newEntityName}
                        onChange={(e) => setNewEntityName(e.target.value)}
                        autoFocus
                    />

                    <input
                        type="email"
                        disabled={loadingNewEntity}
                        className="h-11 w-full rounded-lg bg-[#111714] border border-[#3d5245]
               text-white px-3 disabled:opacity-60"
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
                            ${loadingNewEntity ? 'bg-[#29382f]/60 cursor-not-allowed text-white/50' : 'bg-[#29382f] text-white cursor-pointer'}`}
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
