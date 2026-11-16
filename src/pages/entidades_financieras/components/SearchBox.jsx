export default function SearchBox({ query, setQuery }) {
    return (
        <div className="px-0 my-6">
            <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                    search
                </span>

                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar entidad... (ej: Banco Galicia)"
                    className="
                        w-full h-12
                        rounded-xl
                        border border-primary/50
                        bg-white dark:bg-slate-800/50
                        pl-10 pr-4
                        text-base text-slate-900 dark:text-white
                        placeholder:text-slate-400 dark:placeholder:text-slate-500
                        transition-all
                    "
                />
            </div>
        </div>
    );
}
