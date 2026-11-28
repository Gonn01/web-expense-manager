import { useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/Icon';
import CuotasChart from '@/components/CuotasChart';
import MontoChart from '@/components/MontoChart';
import CategoriaChart from '@/components/CategoriaChart';
import SessionSelector from '@/components/SessionSelector';
import {
    NEXT_SESSION,
    hasChartData,
    lastSessionWithQuotas,
    postponedExpenseCount,
    sessionAt,
    sessionLabel,
} from '@/utils/chart-sessions';
import { useChartHistory } from '@/hooks/use-chart-history';
import { t } from '@/i18n';

export default function ChartsModal({ gastos, entityId = null, onClose }) {
    const hasActiveData = hasChartData(gastos, []);
    const { sessions, loading, loadingMore, hasMore, loadMore } = useChartHistory(entityId, {
        loadFirstPage: !hasActiveData,
    });
    const hasData = hasChartData(gastos, sessions);

    const [sessionIndex, setSessionIndex] = useState(NEXT_SESSION);
    const firstSession = NEXT_SESSION - sessions.length;
    const lastSession = lastSessionWithQuotas(gastos);
    const postponed = postponedExpenseCount(gastos);
    const selected = Math.min(Math.max(sessionIndex, firstSession), lastSession);

    const goBack = () => {
        if (selected - 1 < firstSession) loadMore();
        setSessionIndex(selected - 1);
    };
    const selectSession = (index) =>
        setSessionIndex(Math.min(Math.max(index, firstSession), lastSession));

    const chartProps = {
        gastos,
        history: sessions,
        selectedIndex: selected,
        onSelectSession: selectSession,
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/60" onMouseDown={onClose} />
            <div className="relative z-10 w-[92vw] max-w-4xl lg:max-w-6xl max-h-[90dvh] overflow-y-auto rounded-2xl shadow-xl bg-white dark:bg-[#111714] border border-slate-200 dark:border-[#29382f]">
                <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 dark:border-[#29382f] px-4 sm:px-6 py-4 bg-white dark:bg-[#111714]">
                    <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                        <Icon name="bar_chart" className="text-primary" />
                        <h2 className="text-slate-900 dark:text-white text-lg font-bold">
                            {t('modals.charts')}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label={t('common.close')}
                        className="cursor-pointer text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <Icon name="close" />
                    </button>
                </header>
                {hasData ? (
                    <div className="p-3 sm:p-6 flex flex-col gap-4">
                        <SessionSelector
                            label={sessionLabel({
                                index: selected,
                                session: sessionAt(sessions, selected),
                            })}
                            canGoBack={selected > firstSession || hasMore}
                            canGoForward={selected < lastSession}
                            loading={loadingMore}
                            onBack={goBack}
                            onForward={() => setSessionIndex(selected + 1)}
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {t('charts.pastSessionsNote')}
                        </p>
                        {postponed > 0 && selected >= NEXT_SESSION && (
                            <p className="-mt-2 text-xs text-slate-500 dark:text-slate-400">
                                {t('charts.postponedNote', { count: postponed })}
                            </p>
                        )}
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <div className="grid min-w-0 gap-4 lg:auto-rows-fr">
                                <CuotasChart {...chartProps} />
                                <MontoChart {...chartProps} />
                            </div>
                            <div className="min-w-0">
                                <CategoriaChart {...chartProps} />
                            </div>
                        </div>
                    </div>
                ) : loading ? (
                    <div className="flex items-center justify-center gap-2 px-6 py-12 text-sm text-slate-500 dark:text-slate-400">
                        <Icon name="progress_activity" className="animate-spin" />
                        {t('charts.loadingSessions')}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                        <Icon
                            name="bar_chart"
                            className="text-4xl text-slate-300 dark:text-slate-600"
                        />
                        <p className="text-sm">{t('charts.noData')}</p>
                    </div>
                )}
            </div>
        </div>,
        document.body,
    );
}
