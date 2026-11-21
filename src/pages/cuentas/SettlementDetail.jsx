import { useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Icon from '@/components/Icon';
import Loader from '@/components/Loader';
import CopyButton from '@/components/CopyButton';
import ShareButton from '@/components/ShareButton';
import { formatMoney } from '@/utils/FormatMoney';
import { formatDateTime } from '@/utils/FormatDate';
import {
    buildSettlementEntityText,
    buildSettlementSnapshotText,
} from '@/utils/build-settlement-text';
import { useSettlementDetail, monthLabel } from './hooks/use-settlement-history';
import PaymentStatusBadge from './components/PaymentStatusBadge';
import { t } from '@/i18n';

export default function SettlementDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { snapshot, loading, error } = useSettlementDetail(id);

    const groups = useMemo(() => {
        const items = Array.isArray(snapshot?.items) ? snapshot.items : [];
        const map = new Map();
        for (const it of items) {
            const key = it.entity_id ?? it.entity_name ?? t('common.noEntity');
            if (!map.has(key)) {
                map.set(key, {
                    entityId: it.entity_id ?? null,
                    entityName: it.entity_name ?? t('common.noEntity'),
                    items: [],
                });
            }
            map.get(key).items.push(it);
        }
        return [...map.values()];
    }, [snapshot]);

    if (loading) return <Loader />;

    if (error || !snapshot) {
        return (
            <div className="flex flex-col items-center justify-center flex-1 gap-3 text-slate-500 dark:text-slate-400">
                <Icon name="error" className="text-5xl opacity-40" />
                <p>{t('cuentas.summaryNotFound')}</p>
                <button
                    onClick={() => navigate('/app/settlement')}
                    className="text-primary font-semibold cursor-pointer hover:underline"
                >
                    {t('cuentas.backToHistory')}
                </button>
            </div>
        );
    }

    const totals = snapshot.totals ?? {};
    const byCurrency = totals.byCurrency ?? {};
    const confirmedByCurrency = totals.confirmed?.byCurrency ?? null;

    return (
        <div className="flex flex-col flex-1 lg:min-h-0">
            <button
                onClick={() => navigate('/app/settlement')}
                className="shrink-0 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors cursor-pointer mb-3 w-fit"
            >
                <Icon name="arrow_back" className="text-base" />
                {t('common.settlementHistory')}
            </button>

            <div className="shrink-0 mb-5 flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white capitalize">
                        {monthLabel(snapshot.month)}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {t('settlement.dateRange', {
                            from: formatDateTime(snapshot.started_at),
                            to: formatDateTime(snapshot.finished_at),
                        })}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <CopyButton
                        size="sm"
                        label={t('cuentas.export')}
                        title={t('cuentas.copyMonthSSummary')}
                        getText={() =>
                            buildSettlementSnapshotText(snapshot, monthLabel(snapshot.month))
                        }
                    />
                    <ShareButton
                        size="sm"
                        title={t('cuentas.shareMonthSSummary')}
                        getText={() =>
                            buildSettlementSnapshotText(snapshot, monthLabel(snapshot.month))
                        }
                    />
                </div>
            </div>

            <div className="shrink-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
                {Object.keys(byCurrency).length === 0 && (
                    <p className="text-sm text-slate-400">
                        {t('cuentas.thisSummaryHasNoMarkedExpenses')}
                    </p>
                )}
                {Object.entries(byCurrency).map(([cur, b]) => (
                    <div
                        key={cur}
                        className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/3 p-4"
                    >
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2">
                            {cur}
                        </p>
                        <div className="flex flex-col gap-1 text-sm">
                            <Row
                                label={t('common.expenses')}
                                value={`−${formatMoney(b.egreso, cur)}`}
                                className="text-red-400"
                            />
                            <Row
                                label={t('common.income2')}
                                value={`+${formatMoney(b.ingreso, cur)}`}
                                className="text-emerald-500"
                            />
                            <Row
                                label={t('cuentas.net')}
                                value={formatMoney(b.ingreso - b.egreso, cur)}
                                className="font-bold text-slate-800 dark:text-slate-100 border-t border-black/5 dark:border-white/5 pt-1 mt-1"
                            />
                            {confirmedByCurrency && (
                                <Row
                                    label={t('cuentas.confirmedNet')}
                                    value={formatMoney(
                                        (confirmedByCurrency[cur]?.ingreso ?? 0) -
                                            (confirmedByCurrency[cur]?.egreso ?? 0),
                                        cur,
                                    )}
                                    className="font-semibold text-slate-600 dark:text-slate-300"
                                />
                            )}
                            <Row
                                label={t('cuentas.movements')}
                                value={b.count}
                                className="text-slate-500 dark:text-slate-400"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-4 lg:overflow-y-auto lg:pr-1 flex-1 lg:min-h-0 pb-4">
                {groups.map(({ entityId, entityName, items }) => (
                    <div
                        key={entityId ?? entityName}
                        className="shrink-0 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/3 overflow-hidden"
                    >
                        <div className="px-4 py-2.5 bg-slate-50 dark:bg-white/4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
                            {entityId ? (
                                <Link
                                    to={`/app/entidades/${entityId}`}
                                    title={t('settlement.viewEntity', { name: entityName })}
                                    className="group flex items-center gap-1 min-w-0 font-bold text-slate-800 dark:text-slate-100 hover:text-primary dark:hover:text-primary transition-colors"
                                >
                                    <span className="truncate">{entityName}</span>
                                    <Icon
                                        name="chevron_right"
                                        className="text-base shrink-0 text-slate-400 group-hover:text-primary"
                                    />
                                </Link>
                            ) : (
                                <span className="font-bold text-slate-800 dark:text-slate-100 min-w-0 truncate">
                                    {entityName}
                                </span>
                            )}
                            <div className="flex items-center gap-3 shrink-0">
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {t('settlement.expenses', { count: items.length })}
                                </span>
                                <CopyButton
                                    size="sm"
                                    getText={() => buildSettlementEntityText(entityName, items)}
                                    title={t('settlement.copyEntity', { name: entityName })}
                                />
                                <ShareButton
                                    size="sm"
                                    getText={() => buildSettlementEntityText(entityName, items)}
                                    title={t('settlement.shareEntity', { name: entityName })}
                                />
                            </div>
                        </div>
                        <ul className="divide-y divide-slate-100 dark:divide-white/5">
                            {items.map((it) => {
                                const cuota = cuotaLabel(it);
                                const sharedLabel = sharedPaymentLabel(it);
                                return (
                                    <li key={it.purchase_id}>
                                        <Link
                                            to={`/app/gastos/${it.purchase_id}`}
                                            className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                                                    {it.name}
                                                </p>
                                                <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-2">
                                                    <span
                                                        className={
                                                            it.type === 'INGRESO'
                                                                ? 'text-emerald-500'
                                                                : 'text-red-400'
                                                        }
                                                    >
                                                        {it.type === 'INGRESO'
                                                            ? t('common.income')
                                                            : t('common.expense')}
                                                    </span>
                                                    {it.fixed_expense && (
                                                        <span>{t('cuentas.fixed')}</span>
                                                    )}
                                                    {cuota && (
                                                        <span className="sm:hidden">· {cuota}</span>
                                                    )}
                                                </p>
                                                {sharedLabel && (
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                        {sharedLabel}
                                                    </p>
                                                )}
                                            </div>

                                            <PaymentStatusBadge status={it.payment_status} />

                                            {cuota && (
                                                <span className="hidden sm:inline shrink-0 text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/15 text-primary whitespace-nowrap">
                                                    {cuota}
                                                </span>
                                            )}

                                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap shrink-0">
                                                {formatMoney(it.amount_per_quota, it.currency)}
                                            </span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}

function sharedPaymentLabel(it) {
    if (!it.shared) return null;
    const otra = it.counterparty_name ?? t('people.otherPerson');
    return it.payment_role === 'confirmacion'
        ? t('settlement.confirmedPaymentOf', { name: otra })
        : t('settlement.sharedWith', { name: otra });
}

function cuotaLabel(it) {
    const n = it.quota_number;
    if (!n || n < 1) return null;
    if (it.fixed_expense) return t('settlement.paymentNumber', { number: n });
    return it.number_of_quotas
        ? t('settlement.installmentProgress', { number: n, total: it.number_of_quotas })
        : t('settlement.installmentNumber', { number: n });
}

function Row({ label, value, className = '' }) {
    return (
        <div className={`flex items-center justify-between ${className}`}>
            <span>{label}</span>
            <span>{value}</span>
        </div>
    );
}
