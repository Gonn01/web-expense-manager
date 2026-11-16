import { formatMoney } from '@/utils/FormatMoney';

export function StatCard({ label, value, currency, onClick }) {
    const displayValue = currency ? formatMoney(value, currency) : value;

    return (
        <div
            onClick={onClick}
            className="flex flex-col cursor-pointer gap-2 rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900/50"
        >
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{label}</p>
            <p
                className={`text-xl sm:text-2xl font-bold tracking-tight break-words ${value < 0 ? 'text-red-500' : 'text-green-500'}`}
            >
                {displayValue}
            </p>
        </div>
    );
}
