import { formatMoney } from '@/utils/FormatMoney';
import ProgressBar from '@/components/ProgressBar';
import { t } from '@/i18n';

export default function ProgresoPago({ gasto, porcentaje, totalPagado }) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
                <p className="text-base font-medium">{t('detalleGasto.paymentProgress')}</p>
                {!gasto.fixed_expense && (
                    <span className="text-sm font-semibold text-primary">
                        {porcentaje.toFixed(0)}%
                    </span>
                )}
            </div>

            <ProgressBar
                progress={porcentaje}
                type={gasto.type}
                fixed={gasto.fixed_expense}
                quotas={gasto.number_of_quotas}
                height="h-2"
            />

            <p className="text-sm text-slate-500 dark:text-[#9eb7a8]">
                {gasto.fixed_expense
                    ? t('detail.timesPaid', { count: gasto.payed_quotas })
                    : t('detail.installmentsPaidAmount', {
                          paid: gasto.payed_quotas,
                          total: gasto.number_of_quotas,
                          paidAmount: formatMoney(totalPagado, gasto.currency_type),
                          totalAmount: formatMoney(gasto.amount, gasto.currency_type),
                      })}
            </p>
        </div>
    );
}
