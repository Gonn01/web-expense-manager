import Icon from '@/components/Icon';
import { FieldError } from '@/components/TextInput';
import Select from '@/components/Select';
import NewEntityInlineForm from './NewEntityInlineForm';

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
    const borderClass = error ? 'border-red-500' : 'border-slate-300 dark:border-[#3d5245]';

    return (
        <div className="space-y-2" data-field="entity">
            <label className="text-slate-900 dark:text-white text-sm font-medium">
                Entidad financiera
            </label>

            <div className="relative">
                {loading ? (
                    <div className="h-12 w-full rounded-lg bg-slate-50 dark:bg-[#1c2620] border border-slate-300 dark:border-[#3d5245] animate-pulse flex items-center px-3">
                        <div className="h-4 w-32 bg-slate-100 dark:bg-[#29382f] rounded" />
                    </div>
                ) : entities.length === 0 ? (
                    <div
                        className={`h-12 w-full rounded-lg border ${borderClass} bg-slate-50 dark:bg-[#1c2620] px-3 flex items-center gap-2 text-slate-500 dark:text-[#9eb7a8] text-sm`}
                    >
                        <Icon name="info" className="text-base" />
                        No tenés entidades creadas aún
                    </div>
                ) : (
                    <div className="relative">
                        <Select
                            aria-invalid={error ? true : undefined}
                            className={`h-12 w-full rounded-lg border ${borderClass} bg-slate-50 dark:bg-[#1c2620] px-3 text-slate-900 dark:text-white cursor-pointer`}
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
                <NewEntityInlineForm
                    name={newEntityName}
                    setName={setNewEntityName}
                    email={newEntityEmail}
                    setEmail={setNewEntityEmail}
                    loading={loadingNewEntity}
                    onCancel={() => {
                        setShowNewEntity(false);
                        setNewEntityEmail?.('');
                    }}
                    onCreate={handleCreateEntity}
                />
            )}
        </div>
    );
}
