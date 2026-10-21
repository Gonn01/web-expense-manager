import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/Icon';
import InfoTooltip from '@/components/InfoTooltip';
import { useSettlementStore } from '@/store/use-settlement-store';
import { useSnackbarStore } from '@/store/use-snackbar-store';
import { useDialogStore } from '@/store/use-dialog-store';
import { useSettlement } from '@/hooks/use-settlement';

export function SettlementToggle() {
    const active = useSettlementStore((s) => s.active);
    const startSession = useSettlementStore((s) => s.startSession);
    const [starting, setStarting] = useState(false);

    if (active) return null;

    return (
        <div className="flex items-center gap-1.5">
            <button
                onClick={async () => {
                    setStarting(true);
                    try {
                        await startSession();
                    } finally {
                        setStarting(false);
                    }
                }}
                disabled={starting}
                className="relative cursor-pointer flex items-center h-11 px-5 rounded-lg border border-black/10 dark:border-white/15 text-slate-700 dark:text-slate-200 font-bold hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-60 disabled:cursor-wait"
            >
                <span className={`flex items-center ${starting ? 'invisible' : ''}`}>
                    <Icon name="playlist_add_check" className="mr-2" />
                    Hacer cuentas
                </span>
                {starting && (
                    <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    </span>
                )}
            </button>
            <InfoTooltip
                align="end"
                text={
                    'Al activar este modo, pagar o cobrar un gasto solo lo marca — todavía no ' +
                    'registra el pago. Cuando toques "Terminar" se registran de una vez todos ' +
                    'los pagos marcados y se guarda un resumen del mes. Podés salir y volver ' +
                    'cuando quieras: la sesión queda guardada hasta que la termines.'
                }
            />
        </div>
    );
}

export function SettlementBar({ totalItems = 0 }) {
    const { active, checkedCount, startedLabel } = useSettlement();
    const finishSession = useSettlementStore((s) => s.finishSession);
    const discardSession = useSettlementStore((s) => s.discardSession);
    const showSnackbar = useSnackbarStore((s) => s.show);
    const navigate = useNavigate();
    const confirmDialog = useDialogStore((s) => s.confirm);

    if (!active) return null;

    const pct = totalItems > 0 ? Math.min(100, Math.round((checkedCount / totalItems) * 100)) : 0;

    const handleFinish = async () => {
        if (checkedCount === 0) {
            showSnackbar(
                'Marcá al menos un gasto para terminar las cuentas, o descartá la sesión.',
                'info',
                'playlist_add_check',
            );
            return;
        }
        let snapshot;
        await confirmDialog({
            title: 'Terminar cuentas',
            message:
                '¿Terminar las cuentas de este mes? Se van a registrar los pagos de los gastos marcados y se guardará un resumen.',
            tone: 'info',
            confirmLabel: 'Terminar',
            onConfirm: async () => {
                snapshot = await finishSession();
            },
        });
        if (snapshot) {
            showSnackbar('Cuentas cerradas. Guardamos el resumen del mes.', 'success');
            navigate(`/app/settlement/${snapshot.id}`);
        }
    };

    const handleDiscard = async () => {
        await confirmDialog({
            title: 'Descartar sesión',
            message: '¿Descartar esta sesión? Se pierden las marcas y no se guarda resumen.',
            tone: 'error',
            confirmLabel: 'Descartar',
            onConfirm: discardSession,
        });
    };

    return (
        <div className="mb-4 rounded-xl border border-primary/30 bg-primary/5 dark:bg-primary/10 px-4 py-3">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="flex items-center gap-2 text-primary font-bold">
                    <Icon name="playlist_add_check" />
                    Modo hacer cuentas
                    {startedLabel && (
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                            · iniciado {startedLabel}
                        </span>
                    )}
                    <InfoTooltip
                        align="start"
                        text={
                            '"Terminar" registra todos los pagos marcados y guarda un resumen ' +
                            'del mes. "Descartar" cierra la sesión sin registrar nada: se ' +
                            'pierden las marcas y no queda resumen.'
                        }
                    />
                </div>

                <div className="flex items-center gap-2 min-w-[180px] flex-1">
                    <div className="h-2 flex-1 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {checkedCount}
                        {totalItems > 0 ? ` / ${totalItems}` : ''} marcados
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDiscard}
                        className="cursor-pointer text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                        Descartar
                    </button>
                    <button
                        onClick={handleFinish}
                        className="cursor-pointer flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-background-dark text-sm font-bold hover:bg-primary/90 transition-colors"
                    >
                        <Icon name="check_circle" className="text-base" />
                        Terminar
                    </button>
                </div>
            </div>
        </div>
    );
}
