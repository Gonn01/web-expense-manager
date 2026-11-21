import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/Icon';
import InfoTooltip from '@/components/InfoTooltip';
import { useSettlementStore } from '@/store/use-settlement-store';
import { useSnackbarStore } from '@/store/use-snackbar-store';
import { useDialogStore } from '@/store/use-dialog-store';
import { useSettlement } from '@/hooks/use-settlement';
import { t } from '@/i18n';

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
                className="relative cursor-pointer flex items-center h-11 px-4 sm:px-5 rounded-lg border border-black/10 dark:border-white/15 text-slate-700 dark:text-slate-200 font-bold hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-60 disabled:cursor-wait"
            >
                <span className={`flex items-center ${starting ? 'invisible' : ''}`}>
                    <Icon name="playlist_add_check" className="mr-2" />
                    {t('common.settle')}
                </span>
                {starting && (
                    <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    </span>
                )}
            </button>
            <InfoTooltip align="end" text={t('settlement.modeInfo')} />
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
                t('dashboard.markAtLeastOneExpenseToFinish'),
                'info',
                'playlist_add_check',
            );
            return;
        }
        let snapshot;
        await confirmDialog({
            title: t('dashboard.finishSettlement'),
            message: t('dashboard.finishThisMonthSSettlementPaymentsFor'),
            tone: 'info',
            confirmLabel: t('common.finish'),
            onConfirm: async () => {
                snapshot = await finishSession();
            },
        });
        if (snapshot) {
            showSnackbar(t('dashboard.settlementClosedWeSavedThisMonthS'), 'success');
            navigate(`/app/settlement/${snapshot.id}`);
        }
    };

    const handleDiscard = async () => {
        await confirmDialog({
            title: t('dashboard.discardSession'),
            message: t('dashboard.discardThisSessionTheMarksAreLost'),
            tone: 'error',
            confirmLabel: t('common.discard'),
            onConfirm: discardSession,
        });
    };

    return (
        <div className="mb-4 rounded-xl border border-primary/30 bg-primary/5 dark:bg-primary/10 px-4 py-3">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="flex flex-wrap items-center gap-2 text-primary font-bold">
                    <Icon name="playlist_add_check" />
                    {t('dashboard.settleMode')}
                    {startedLabel && (
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                            {t('dashboard.started')} {startedLabel}
                        </span>
                    )}
                    <InfoTooltip align="start" text={t('settlement.activeInfo')} />
                </div>

                <div className="flex items-center gap-2 basis-full sm:basis-auto sm:min-w-[180px] flex-1">
                    <div className="h-2 flex-1 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {checkedCount}
                        {totalItems > 0 ? ` / ${totalItems}` : ''} {t('dashboard.marked')}
                    </span>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    <button
                        onClick={handleDiscard}
                        className="cursor-pointer text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                        {t('common.discard')}
                    </button>
                    <button
                        onClick={handleFinish}
                        className="cursor-pointer flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-background-dark text-sm font-bold hover:bg-primary/90 transition-colors"
                    >
                        <Icon name="check_circle" className="text-base" />
                        {t('common.finish')}
                    </button>
                </div>
            </div>
        </div>
    );
}
