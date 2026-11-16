export default function CurrencyBadge({ currency, muted = false }) {
    return (
        <span
            className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${
                muted
                    ? 'bg-black/5 dark:bg-white/5 text-slate-500'
                    : 'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-200'
            }`}
        >
            {currency}
        </span>
    );
}
