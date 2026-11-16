import { formatMoney } from '@/utils/FormatMoney';
import ProgressBar from '@/components/ProgressBar';

export default function ProgresoPago({ gasto, porcentaje, totalPagado }) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
                <p className="text-base font-medium">Progreso de Pago</p>
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
                    ? `Veces pagado ${gasto.payed_quotas}`
                    : `${gasto.payed_quotas} de ${gasto.number_of_quotas} cuotas pagadas (${formatMoney(totalPagado, gasto.currency_type)} / ${formatMoney(gasto.amount, gasto.currency_type)})`}
            </p>
        </div>
    );
}
