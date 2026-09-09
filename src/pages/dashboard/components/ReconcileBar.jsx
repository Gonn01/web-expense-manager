import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/Icon';
import { useReconcileStore } from '@/store/use-reconcile-store';
import { useSnackbarStore } from '@/store/use-snackbar-store';
import { useReconcile } from '@/hooks/use-reconcile';

/** Botón del header del dashboard para activar el modo. */
export function ReconcileToggle() {
    const active = useReconcileStore((s) => s.active);
    const startSession = useReconcileStore((s) => s.startSession);
    const [starting, setStarting] = useState(false);

    if (active) return null;

    return (
        <button
            onClick={async () => {
                setStarting(true);
                await startSession();
                setStarting(false);
            }}
            disabled={starting}
            className="cursor-pointer flex items-center h-11 px-5 rounded-lg border border-black/10 dark:border-white/15 text-slate-700 dark:text-slate-200 font-bold hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-60"
        >
            <Icon name="playlist_add_check" className="mr-2" />
            Hacer cuentas
        </button>
    );
}

/** Banner visible mientras la sesión de cuentas está abierta. */
export function ReconcileBar({ totalItems = 0 }) {
    const { active, checkedCount, startedLabel } = useReconcile();
    const finishSession = useReconcileStore((s) => s.finishSession);
    const discardSession = useReconcileStore((s) => s.discardSession);
    const showSnackbar = useSnackbarStore((s) => s.show);
    const navigate = useNavigate();
    const [working, setWorking] = useState(false);

    if (!active) return null;

    const pct = totalItems > 0 ? Math.min(100, Math.round((checkedCount / totalItems) * 100)) : 0;

    const handleFinish = async () => {
        if (
            !confirm(
                '¿Terminar las cuentas de este mes? Se van a registrar los pagos de los gastos marcados y se guardará un resumen.',
            )
        )
            return;
        setWorking(true);
        const snapshot = await finishSession();
        setWorking(false);
        if (snapshot) {
            showSnackbar('Cuentas cerradas. Guardamos el resumen del mes.', 'success');
            navigate(`/app/cuentas/${snapshot.id}`);
        }
    };

    const handleDiscard = async () => {
        if (!confirm('¿Descartar esta sesión? Se pierden las marcas y no se guarda resumen.'))
            return;
        setWorking(true);
        await discardSession();
        setWorking(false);
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
                        disabled={working}
                        className="cursor-pointer text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-50"
                    >
                        Descartar
                    </button>
                    <button
                        onClick={handleFinish}
                        disabled={working}
                        className="cursor-pointer flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-background-dark text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
                    >
                        <Icon name="check_circle" className="text-base" />
                        Terminar
                    </button>
                </div>
            </div>
        </div>
    );
}
