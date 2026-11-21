import { ExpenseType } from '@/utils/enums';
import { t } from '@/i18n';

export function ChipTipoGasto({ fijo, tipo, column = false }) {
    const tipoColor =
        tipo === ExpenseType.INGRESO
            ? 'bg-green-400/20 text-green-400'
            : 'bg-red-400/20 text-red-400';

    const tipoChip = (
        <span className={`text-center text-xs font-semibold px-2.5 py-1 rounded-full ${tipoColor}`}>
            {tipo}
        </span>
    );

    if (fijo) {
        return (
            <div className={`flex ${column ? 'flex-col' : 'items-center'} gap-2`}>
                <span className="text-center text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-400/20 text-yellow-400">
                    {t('common.fixedExpense')}
                </span>
                {tipoChip}
            </div>
        );
    }

    return tipoChip;
}
