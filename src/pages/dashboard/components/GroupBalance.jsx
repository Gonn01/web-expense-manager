import { convertCurrency } from '@/utils/convert-currency';
import { formatMoney } from '@/utils/FormatMoney';

export default function GroupBalance({ items, preferredCurrency, rates }) {
    const cur = preferredCurrency ?? 'ARS';
    const balance = items.reduce((sum, it) => {
        const quota =
            convertCurrency(Number(it.amount_per_quota ?? 0), it.currency_type, cur, rates) ?? 0;
        return sum + (it.type === 'INGRESO' ? quota : -quota);
    }, 0);

    if (items.length === 0) return null;

    return (
        <span
            className={`text-xs font-semibold ${balance >= 0 ? 'text-emerald-500' : 'text-red-400'}`}
        >
            {balance >= 0 ? '+' : ''}
            {formatMoney(balance, cur)}
        </span>
    );
}
