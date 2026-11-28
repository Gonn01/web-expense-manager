import { getIntlLocale, t } from '@/i18n';
import { ExpenseType } from './enums';

export const NEXT_SESSION = 0;

function postponedShift(gasto) {
    return gasto.is_postponed ? 1 : 0;
}

export function pendingQuotaSessions(gasto) {
    const total = Number(gasto.number_of_quotas || 0);
    const paid = Number(gasto.payed_quotas || 0);
    const remaining = total - paid;
    if (gasto.fixed_expense || remaining <= 0 || total === 0) return null;
    const start = NEXT_SESSION + postponedShift(gasto);
    return { start, end: start + remaining - 1 };
}

export function fixedExpenseStartSession(gasto) {
    return NEXT_SESSION + postponedShift(gasto);
}

export function expenseAmountInSession(gasto, index) {
    if (gasto.fixed_expense) {
        return index >= fixedExpenseStartSession(gasto) ? Number(gasto.amount || 0) : 0;
    }
    const range = pendingQuotaSessions(gasto);
    if (!range || index < range.start || index > range.end) return 0;
    return Number(gasto.amount_per_quota || 0);
}

export function postponedExpenseCount(gastos = []) {
    return gastos.filter(
        (g) => g.is_postponed && (g.fixed_expense || pendingQuotaSessions(g) !== null),
    ).length;
}

export function lastSessionWithQuotas(gastos = []) {
    let last = NEXT_SESSION;
    for (const g of gastos) {
        const end = g.fixed_expense ? fixedExpenseStartSession(g) : pendingQuotaSessions(g)?.end;
        if (end !== undefined && end > last) last = end;
    }
    return last;
}

export function hasChartData(gastos = [], history = []) {
    return (
        gastos.some((g) => g.type === ExpenseType.EGRESO || pendingQuotaSessions(g) !== null) ||
        history.some((session) => session.items?.length > 0)
    );
}

export function futureQuotaTotals(gastos, type, valueOf = () => 1) {
    const totals = new Map();
    for (const g of gastos) {
        if (g.type !== type) continue;
        const range = pendingQuotaSessions(g);
        if (!range) continue;
        const value = valueOf(Number(g.amount_per_quota || 0), g.currency_type);
        if (value === null) continue;
        for (let index = range.start; index <= range.end; index++) {
            totals.set(index, (totals.get(index) ?? 0) + value);
        }
    }
    return totals;
}

export function pastQuotaTotal(session, type, valueOf = () => 1) {
    let total = 0;
    for (const item of session.items ?? []) {
        if (item.type !== type || item.fixed_expense) continue;
        const value = valueOf(Number(item.amount_per_quota || 0), item.currency);
        if (value !== null) total += value;
    }
    return total;
}

export function sessionColumns(gastos = [], history = []) {
    const past = [...history].reverse().map((session, i) => ({
        key: `past-${session.id}`,
        index: i - history.length,
        session,
    }));
    const last = lastSessionWithQuotas(gastos);
    const future = Array.from({ length: last - NEXT_SESSION + 1 }, (_, i) => ({
        key: `next-${i}`,
        index: NEXT_SESSION + i,
        session: null,
    }));
    return [...past, ...future];
}

export function sessionAt(history, index) {
    if (index >= NEXT_SESSION) return null;
    return history[NEXT_SESSION - index - 1] ?? null;
}

export function categoryEntriesForSession(gastos, history, index, type = ExpenseType.EGRESO) {
    if (index < NEXT_SESSION) {
        const session = sessionAt(history, index);
        return (session?.items ?? [])
            .filter((item) => item.type === type)
            .map((item) => ({
                amount: Number(item.amount_per_quota || 0),
                currency: item.currency,
                categories: item.categories ?? [],
            }));
    }
    return gastos
        .filter((g) => g.type === type)
        .map((g) => ({
            amount: expenseAmountInSession(g, index),
            currency: g.currency_type,
            categories: Array.isArray(g.categories) ? g.categories : [],
        }));
}

function formatSessionDate(value, options) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString(getIntlLocale(), options);
}

export function shortSessionDate(value) {
    return formatSessionDate(value, { day: 'numeric', month: 'short' });
}

export function longSessionDate(value) {
    return formatSessionDate(value, { day: 'numeric', month: 'long', year: 'numeric' });
}

export function sessionLabel(column, { short = false } = {}) {
    if (column.index < NEXT_SESSION) {
        const date = column.session?.finished_at;
        return short
            ? shortSessionDate(date)
            : t('charts.pastSession', { date: longSessionDate(date) });
    }
    if (column.index === NEXT_SESSION) {
        return short ? t('charts.nextSessionShort') : t('charts.nextSession');
    }
    const count = column.index - NEXT_SESSION;
    return short ? t('charts.sessionAheadShort', { count }) : t('charts.sessionAhead', { count });
}
