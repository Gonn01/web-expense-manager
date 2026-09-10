export function TabHeader({ tab, setTab, pendingCount = 0 }) {
    const tabs = ['activos', 'finalizados'];
    if (pendingCount > 0) tabs.push('pendientes');
    tabs.push('eliminados');
    tabs.push('log');

    const labelFor = (t) =>
        t === 'activos'
            ? 'Gastos Activos'
            : t === 'finalizados'
              ? 'Gastos Finalizados'
              : t === 'fijos'
                ? 'Gastos Fijos'
                : t === 'pendientes'
                  ? 'Pendientes'
                  : t === 'eliminados'
                    ? 'Eliminados'
                    : 'Historial';

    return (
        <div className="border-b border-zinc-200 dark:border-zinc-800 mb-4">
            <div className="flex gap-6">
                {tabs.map((t) => (
                    <button
                        key={t}
                        className={`pb-3 pt-2 text-sm flex items-center gap-1.5 ${
                            tab === t
                                ? 'text-primary font-bold border-b-2 border-b-primary'
                                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 cursor-pointer dark:hover:text-zinc-200 border-b-2 border-b-transparent'
                        }`}
                        onClick={() => setTab(t)}
                    >
                        {labelFor(t)}
                        {t === 'pendientes' && (
                            <span className="rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold px-1.5 min-w-5 text-center">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
