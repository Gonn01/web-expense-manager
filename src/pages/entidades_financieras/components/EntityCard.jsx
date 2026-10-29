import EntityIcon from './EntityIcon';

export default function EntityCard({ entity, onClick, onDelete }) {
    return (
        <div
            className="group relative w-full text-left flex gap-4 bg-white dark:bg-slate-800/50 
                       p-4 rounded-xl items-center justify-between shadow-sm border border-slate-200 
                       dark:border-slate-800 hover:shadow-lg hover:dark:bg-slate-800 
                       transition-all cursor-pointer"
            onClick={() => onClick?.(entity)}
        >
            <div className="flex items-center gap-4">
                <EntityIcon type={entity.type} />

                <div className="flex flex-1 flex-col justify-center">
                    <p className="text-slate-900 dark:text-white text-base font-bold leading-normal">
                        {entity.name}
                    </p>

                    <p className="mt-1 text-slate-500 dark:text-slate-400 text-xs font-normal leading-normal">
                        {entity.cantidad == undefined ? 0 : entity.cantidad} gasto
                        {entity.cantidad === 1 ? ' activo' : 's activos'}
                    </p>

                    {entity.linked_user_name && (
                        <p className="mt-1 flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-normal leading-normal">
                            <span className="material-symbols-outlined text-sm">person</span>
                            Vinculada a: {entity.linked_user_name}
                        </p>
                    )}
                </div>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(entity);
                }}
                className="cursor-pointer
                    absolute right-3 top-1/2 -translate-y-1/2
                    opacity-0 translate-x-2
                    group-hover:opacity-100 group-hover:translate-x-0
                    transition-all duration-200
                    text-red-500 hover:text-red-600
                "
                title="Eliminar entidad"
            >
                <span className="material-symbols-outlined text-2xl">delete</span>
            </button>
        </div>
    );
}
