import TextInput from '@/components/TextInput';
import { LockReason } from './LockedField';

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
                        label="Cantidad de cuotas"
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
                        label="Cuotas pagadas"
                        type="number"
                        value={paidInstallments}
                        disabled={Boolean(paidLock)}
                        onChange={(e) => {
                            const value = Number(e.target.value);
                            const max = Number(installments) || 0;

                            if (value < 0) return setPaidInstallments('0');

                            if (value > max) return setPaidInstallments(String(max));

                            setPaidInstallments(e.target.value);
                        }}
                    />
                    <LockReason reason={paidLock} />
                </div>
            </div>

            <div>
                <p className="text-white text-sm font-medium">Progreso</p>
                <div className="w-full bg-[#29382f] rounded-full h-2.5">
                    <div
                        className="bg-primary h-2.5 rounded-full"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
                <p className="text-right text-xs text-[#9eb7a8] mt-1">
                    {paid} de {totalInstallments} cuotas pagadas
                </p>
            </div>
        </>
    );
}
