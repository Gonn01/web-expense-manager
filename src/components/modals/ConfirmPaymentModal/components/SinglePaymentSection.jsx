import { ChipTipoGasto } from '@/components/ChipTipoGasto';
import { formatMoney } from '@/utils/FormatMoney';
import ProgressBar from '@/components/ProgressBar';
import CurrencyBadge from './CurrencyBadge';

export default function SinglePaymentSection({ item }) {
    return (
        <div className="flex flex-col gap-4 rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-4 text-left text-slate-900 dark:text-white">
            <div className="flex items-start justify-between gap-4 ">
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold">{item.name}</p>

                    <div className="flex items-center gap-2 text-xs">
                        <ChipTipoGasto tipo={item.type} fijo={item.fixed_expense} />
                        <CurrencyBadge currency={item.currency_type} />
                        {!item.fixed_expense && (
                            <span>
                                {item.payed_quotas}/{item.number_of_quotas} cuotas pagadas
                            </span>
                        )}
                    </div>
                </div>

                <div className="text-right">
                    <p className="font-medium">
                        {formatMoney(item.amount_per_quota, item.currency_type)}
                    </p>

                    {!item.fixed_expense && (
                        <p className="text-xs text-slate-500">
                            de {formatMoney(item.amount, item.currency_type)}
                        </p>
                    )}
                </div>
            </div>

            {!item.fixed_expense && item.number_of_quotas > 0 && (
                <ProgressBar
                    progress={Math.min(100, (item.payed_quotas / item.number_of_quotas) * 100)}
                    previewProgress={Math.min(
                        100,
                        ((item.payed_quotas + 1) / item.number_of_quotas) * 100,
                    )}
                    type={item.type}
                    fixed={false}
                    quotas={item.number_of_quotas}
                />
            )}

            <p className="text-xs text-slate-500"></p>

            <div className="rounded-lg border border-black/10 p-3 bg-white/60 dark:bg-background-dark/60">
                <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">
                        Monto a pagar ({item.currency_type})
                    </span>
                    <span className="text-lg font-bold">
                        {formatMoney(item.amount_per_quota, item.currency_type)}
                    </span>
                </div>
            </div>
        </div>
    );
}
