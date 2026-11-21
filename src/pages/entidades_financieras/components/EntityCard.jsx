import EntityIcon from './EntityIcon';
import Icon from '@/components/Icon';

export default function EntityCard({
    entity,
    onClick,
    onDelete,
    onToggleFavorite,
    favoriteBusy = false,
}) {
    return (
        <div
            className="group relative w-full text-left flex gap-4 bg-white dark:bg-slate-800/50 
                       p-4 rounded-xl items-center justify-between shadow-sm border border-slate-200 
                       dark:border-slate-800 hover:shadow-lg hover:dark:bg-slate-800 
                       transition-all cursor-pointer"
            onClick={() => onClick?.(entity)}
        >
            <div className="flex items-center gap-3 min-w-0 pr-8">
                <button
                    type="button"
                    disabled={favoriteBusy}
                    aria-label={
                        entity.is_favorite
                            ? 'Quitar entidad de favoritos'
                            : 'Marcar entidad como favorita'
                    }
                    title={entity.is_favorite ? 'Quitar de favoritos' : 'Marcar como favorita'}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite?.(entity);
                    }}
                    className={`shrink-0 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-wait ${
                        entity.is_favorite
                            ? 'text-amber-400 hover:text-amber-500'
                            : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'
                    }`}
                >
                    <Icon name="star" className="text-xl" filled={Boolean(entity.is_favorite)} />
                </button>
                <EntityIcon type={entity.type} />

                <div className="flex flex-1 flex-col justify-center min-w-0">
                    <p className="text-slate-900 dark:text-white text-base font-bold leading-normal break-words">
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
                    [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:translate-x-2
                    [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:translate-x-0
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
