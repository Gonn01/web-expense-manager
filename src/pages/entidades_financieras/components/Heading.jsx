export default function Heading({ onCreate, viewMode, setViewMode, setShowDeletedModal }) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-slate-900 dark:text-white text-4xl font-black tracking-tighter">
                Mis Entidades
            </h1>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 rounded-lg border border-black/10 dark:border-white/10 p-1">
                    <button
                        type="button"
                        onClick={() => setViewMode?.('list')}
                        title="Vista de lista"
                        className={`flex items-center justify-center rounded-md h-8 w-8 transition-colors ${
                            viewMode === 'list'
                                ? 'bg-primary/20 text-primary'
                                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}
                    >
                        <span className="material-symbols-outlined text-lg">view_list</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode?.('grid')}
                        title="Vista de cuadrícula"
                        className={`flex items-center justify-center rounded-md h-8 w-8 transition-colors ${
                            viewMode === 'grid'
                                ? 'bg-primary/20 text-primary'
                                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}
                    >
                        <span className="material-symbols-outlined text-lg">grid_view</span>
                    </button>
                </div>

                <button
                    onClick={() => setShowDeletedModal?.(true)}
                    className="flex min-w-[84px] items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 border border-black/10 dark:border-white/10 text-slate-700 dark:text-white text-sm font-bold tracking-wide hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">restore</span>
                    <span className="truncate">Ver eliminadas</span>
                </button>

                <button
                    onClick={onCreate}
                    className="flex min-w-[84px] items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-background-dark text-sm font-bold tracking-wide shadow-sm hover:opacity-90 transition-opacity"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    <span className="truncate">Nueva Entidad</span>
                </button>
            </div>
        </div>
    );
}
