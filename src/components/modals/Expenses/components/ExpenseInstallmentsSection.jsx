import TextInput from '@/components/TextInput';
import { LockReason } from './LockedField';
import { t } from '@/i18n';

export default function ExpenseInstallmentsSection({
    installments,
    setInstallments,
    paidInstallments,
    paid,
    totalInstallments,
    progressPct,
    setPaidInstallments,
    error,
    installmentsLock,
    paidLock,
}) {
    return (
        <>
            <div className="grid grid-cols-2 gap-4 items-start">
                <div className="space-y-1.5" data-field="installments">
                    <TextInput
                        label={t('modals.numberOfInstallments')}
                        type="number"
                        value={installments}
                        disabled={Boolean(installmentsLock)}
                        onChange={(e) => setInstallments(e.target.value)}
                        error={error}
                    />
                    <LockReason reason={installmentsLock} />
                </div>

                <div className="space-y-1.5">
                    <TextInput
                        label={t('modals.paidInstallments')}
                        type="number"
                        value={paidInstallments}
                        placeholder="0"
                        disabled={Boolean(paidLock)}
                        onChange={(e) => {
                            const value = Number(e.target.value);
                            const max = Number(installments) || 0;

                            if (value < 0) return setPaidInstallments('');

                            if (value > max) return setPaidInstallments(String(max));

                            setPaidInstallments(e.target.value);
                        }}
                    />
                    <LockReason reason={paidLock} />
                </div>
            </div>

            <div>
                <p className="text-slate-900 dark:text-white text-sm font-medium">
                    {t('common.progress')}
                </p>
                <div className="w-full bg-slate-100 dark:bg-[#29382f] rounded-full h-2.5">
                    <div
                        className="bg-primary h-2.5 rounded-full"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
                <p className="text-right text-xs text-slate-500 dark:text-[#9eb7a8] mt-1">
                    {t('form.paidProgress', { paid, total: totalInstallments })}
                </p>
            </div>
        </>
    );
}
