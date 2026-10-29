export default function ProgressBar({
    progress,
    type,
    fixed,
    quotas = 0,
    height = 'h-1.5',
    previewProgress = null,
}) {
    const color = fixed ? 'bg-yellow-400' : type === 'INGRESO' ? 'bg-green-500' : 'bg-red-500';

    const previewColor = fixed
        ? 'bg-yellow-300/50'
        : type === 'INGRESO'
          ? 'bg-green-400/40'
          : 'bg-red-400/40';

    const dividers =
        fixed || quotas <= 1
            ? []
            : Array.from({ length: quotas - 1 }, (_, i) => ((i + 1) / quotas) * 100);

    return (
        <div
            className={`relative w-full ${height} rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden`}
        >
            {previewProgress !== null && previewProgress > progress && (
                <div
                    className={`absolute inset-y-0 left-0 ${height} ${previewColor} transition-all duration-500`}
                    style={{ width: `${previewProgress}%` }}
                />
            )}
            <div
                className={`absolute inset-y-0 left-0 ${height} rounded-full transition-all duration-500 ${color}`}
                style={{ width: `${progress}%` }}
            />
            {dividers.map((pos) => (
                <div
                    key={pos}
                    className="absolute inset-y-0 w-px bg-black/20 dark:bg-black/40 z-10"
                    style={{ left: `${pos}%` }}
                />
            ))}
        </div>
    );
}
