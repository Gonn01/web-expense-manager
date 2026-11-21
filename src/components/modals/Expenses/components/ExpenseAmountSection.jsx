import Icon from '@/components/Icon';
import TextInput from '@/components/TextInput';
import { Currency } from '@/utils/enums';
import { LockReason } from './LockedField';
import Select from '@/components/Select';
import { t } from '@/i18n';

export default function ExpenseAmountSection({
    amount,
    setAmount,
    currency,
    setCurrency,
    amountLock,
    currencyLock,
    amountNote,
    error,
}) {
    const liveError =
        amount !== '' && Number(amount) <= 0 ? t('modals.theAmountMustBeGreaterThan0') : null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-start">
            <div className="sm:col-span-3 space-y-1.5" data-field="amount">
                <TextInput
                    label={t('modals.totalAmount')}
                    type="amount"
                    placeholder={t('modals.eG150000')}
                    value={amount}
                    disabled={Boolean(amountLock)}
                    onChange={setAmount}
                    error={liveError ?? error}
                />

                <LockReason reason={amountLock} />

                {amountNote && !amountLock && (
                    <p className="flex items-start gap-1.5 text-xs text-yellow-400">
                        <Icon name="info" className="text-sm shrink-0" />
                        <span>{amountNote}</span>
                    </p>
                )}
            </div>

            <div className="relative sm:col-span-2 space-y-2">
                <label className="text-slate-900 dark:text-white text-sm font-medium">
                    {t('common.currency')}
                </label>

                <div className="relative">
                    <Select
                        className="h-12 w-full rounded-lg border border-slate-300 dark:border-[#3d5245] bg-slate-50 dark:bg-[#1c2620] px-3 text-slate-900 dark:text-white cursor-pointer"
                        value={currency}
                        disabled={Boolean(currencyLock)}
                        onChange={setCurrency}
                        aria-label={t('common.currency')}
                        options={Object.values(Currency).map((curr) => ({
                            value: curr,
                            label: curr,
                        }))}
                    />
                </div>

                <LockReason reason={currencyLock} />
            </div>
        </div>
    );
}
