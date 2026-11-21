import Icon from '@/components/Icon';
import { ExpenseType } from '@/utils/enums';
import { t } from '@/i18n';

export default function ExpenseTypeSelector({ type, setType }) {
    return (
        <div className="flex h-12 items-center justify-center rounded-lg bg-slate-100 dark:bg-[#29382f] p-1.5">
            <label className="flex cursor-pointer h-full grow items-center justify-center gap-2 rounded-md px-3 text-slate-500 dark:text-[#9eb7a8] text-sm font-medium has-checked:bg-red-500/10 has-checked:text-red-400">
                <Icon name="arrow_upward" />
                <span>{t('modals.expense')}</span>
                <input
                    type="radio"
                    className="invisible w-0"
                    value={ExpenseType.EGRESO}
                    checked={type === ExpenseType.EGRESO}
                    onChange={() => setType(ExpenseType.EGRESO)}
                />
            </label>

            <label className="flex cursor-pointer h-full grow items-center justify-center gap-2 rounded-md px-3 text-slate-500 dark:text-[#9eb7a8] text-sm font-medium has-checked:bg-green-500/10 has-checked:text-green-400">
                <Icon name="arrow_downward" />
                <span>{t('modals.income')}</span>
                <input
                    type="radio"
                    className="invisible w-0"
                    value={ExpenseType.INGRESO}
                    checked={type === ExpenseType.INGRESO}
                    onChange={() => setType(ExpenseType.INGRESO)}
                />
            </label>
        </div>
    );
}
