import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/Icon';
import Select from '@/components/Select';
import { useEntitiesStore } from '@/store/use-entities-store';
import { transferTargets } from '@/utils/expense-transfer';

export default function TransferExpenseModal({ gasto, onClose, onTransfer }) {
    const entities = useEntitiesStore((s) => s.entities);
    const [target, setTarget] = useState('');
    const [saving, setSaving] = useState(false);

    const currentName = entities.find((e) => e.id == gasto.financial_entity_id)?.name ?? '-';

    const options = useMemo(
        () => transferTargets(gasto, entities).map((e) => ({ value: String(e.id), label: e.name })),
        [gasto, entities],
    );

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e) => e.key === 'Escape' && !saving && onClose?.();
        document.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prev;
            document.removeEventListener('keydown', onKey);
        };
    }, [onClose, saving]);

    const handleTransfer = async () => {
        if (!target || saving) return;
        setSaving(true);
        try {
            const label = options.find((o) => o.value === target)?.label ?? '';
            await onTransfer?.(Number(target), label);
        } catch {
        } finally {
            setSaving(false);
        }
    };

    const close = () => !saving && onClose?.();

    return createPortal(
        <>
            <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onMouseDown={close} />

            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8"
                aria-modal="true"
                role="dialog"
                aria-labelledby="transfer-expense-title"
                onMouseDown={(e) => e.target === e.currentTarget && close()}
            >
                <div className="relative flex flex-col w-full max-w-lg max-h-full overflow-y-auto bg-white dark:bg-[#18211b] rounded-xl border border-slate-300 dark:border-[#3d5245] shadow-xl">
                    <div className="flex items-start justify-between gap-3 p-4 sm:p-6">
                        <div className="flex flex-col gap-1">
                            <h2
                                id="transfer-expense-title"
                                className="text-slate-900 dark:text-white text-xl font-bold tracking-tight"
                            >
                                Transferir gasto
                            </h2>
                            <p className="text-slate-500 dark:text-[#9eb7a8] text-sm">
                                Mové “{gasto.name}” a otra entidad. Sus pagos e historial se
                                mantienen.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="text-slate-500 dark:text-[#9eb7a8] transition-colors duration-200 hover:text-slate-900 dark:hover:text-white"
                            onClick={close}
                            aria-label="Cerrar"
                        >
                            <Icon name="close" />
                        </button>
                    </div>

                    <div className="flex-1 px-6 pb-6 flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <p className="text-slate-500 dark:text-[#9eb7a8] text-sm">
                                Entidad actual
                            </p>
                            <p className="text-slate-900 dark:text-white text-base font-medium">
                                {currentName}
                            </p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <p className="text-slate-900 dark:text-white text-sm font-medium">
                                Transferir a
                            </p>
                            {options.length ? (
                                <Select
                                    value={target}
                                    onChange={setTarget}
                                    options={options}
                                    placeholder="Elegí una entidad"
                                    disabled={saving}
                                    aria-label="Entidad de destino"
                                />
                            ) : (
                                <p className="text-slate-500 dark:text-[#9eb7a8] text-sm">
                                    No tenés otra entidad a la que se pueda transferir este gasto.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 p-6 bg-slate-50/60 dark:bg-[#1c2620]/60 border-t border-slate-300 dark:border-[#3d5245]">
                        <button
                            type="button"
                            disabled={saving}
                            className="flex w-full sm:w-auto min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-5 bg-slate-100 dark:bg-[#29382f] text-slate-900 dark:text-white text-sm font-bold tracking-wide transition-colors duration-200 hover:bg-slate-200 dark:hover:bg-[#34453a] disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={close}
                        >
                            <span className="truncate">Cancelar</span>
                        </button>
                        <button
                            type="button"
                            disabled={!target || saving}
                            className="relative flex w-full sm:w-auto min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-5 bg-primary text-[#111714] text-sm font-bold tracking-wide transition-opacity duration-200 hover:opacity-80 disabled:opacity-60 disabled:cursor-not-allowed"
                            onClick={handleTransfer}
                        >
                            <span className={`truncate ${saving ? 'invisible' : ''}`}>
                                Transferir
                            </span>
                            {saving && (
                                <span className="absolute w-4 h-4 border-2 border-[#111714]/30 border-t-[#111714] rounded-full animate-spin" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>,
        document.body,
    );
}
