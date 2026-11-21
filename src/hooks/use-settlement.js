import { useMemo } from 'react';
import { useSettlementStore } from '@/store/use-settlement-store';
import { t } from '@/i18n';

export function useSettlement() {
    const active = useSettlementStore((s) => s.active);
    const session = useSettlementStore((s) => s.session);
    const checkedExpenses = useSettlementStore((s) => s.checkedExpenses);
    const loading = useSettlementStore((s) => s.loading);

    const checkedCount = useMemo(() => Object.keys(checkedExpenses).length, [checkedExpenses]);

    return {
        active,
        session,
        startedAt: session?.started_at ?? null,
        startedLabel: session?.started_at ? relativeSince(session.started_at) : null,
        checkedExpenses,
        checkedCount,
        loading,
    };
}

function relativeSince(iso) {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return null;
    const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
    if (mins < 1) return t('settlement.since.now');
    if (mins < 60) return t('settlement.since.minutes', { count: mins });
    const hours = Math.round(mins / 60);
    if (hours < 24) return t('settlement.since.hours', { count: hours });
    const days = Math.round(hours / 24);
    return t('settlement.since.days', { count: days });
}
