import { ChipTipoGasto } from '@/components/ChipTipoGasto';
import ProgressBar from '@/components/ProgressBar';
import { formatDate } from '@/utils/FormatDate';
import { formatMoney } from '@/utils/FormatMoney';
import { t } from '@/i18n';

export default function GastoItem({ gasto, variant = 'activo', onClick }) {
    let subtitle = '';

    switch (variant) {
        case 'activo':
            subtitle = gasto.fixed_expense
                ? t('detail.timesPaid', { count: gasto.payed_quotas })
                : t('detail.installmentsShort', {
                      paid: gasto.payed_quotas,
                      total: gasto.number_of_quotas,
                  });
            break;

        case 'finalizado':
            subtitle = t('detalleEntidad.finished');
            break;
    }

    const currency = gasto.currency_type;
    let progress = 0;
    if (gasto.fixed_expense) progress = 100;
    else if (gasto.number_of_quotas > 0)
        progress = (gasto.payed_quotas / gasto.number_of_quotas) * 100;

    const paidTotal = (gasto.payed_quotas ?? 0) * (gasto.amount_per_quota ?? 0);
    const percentageLabel = gasto.fixed_expense ? null : `${Math.round(progress)}%`;

    return (
        <div
            onClick={onClick}
            className="flex flex-col gap-2 py-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded-lg px-2 transition-colors"
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <ChipTipoGasto fijo={gasto.fixed_expense} tipo={gasto.type} column={true} />
                    <div className="min-w-0">
                        <p className="font-medium text-zinc-900 dark:text-white break-words">
                            {gasto.name}
                        </p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-0.5 shrink-0 text-right">
                    <p className="font-semibold text-primary">
                        {variant === 'finalizado'
                            ? formatDate(gasto.finalization_date)
                            : formatMoney(gasto.amount, currency)}
                    </p>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{currency}</span>
                </div>
            </div>

            {variant === 'activo' && (
                <>
                    <ProgressBar
                        progress={progress}
                        type={gasto.type}
                        fixed={gasto.fixed_expense}
                        quotas={gasto.number_of_quotas}
                        height="h-1"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                        <span>
                            {t('detail.paidOf', {
                                paid: formatMoney(paidTotal, currency),
                                total: formatMoney(gasto.amount, currency),
                            })}
                        </span>
                        <div className="flex items-center gap-2">
                            {!gasto.fixed_expense && (
                                <span>
                                    {t('detail.perInstallment', {
                                        amount: formatMoney(gasto.amount_per_quota, currency),
                                    })}
                                </span>
                            )}
                            {percentageLabel && (
                                <span className="font-semibold text-zinc-600 dark:text-zinc-300">
                                    {percentageLabel}
                                </span>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
