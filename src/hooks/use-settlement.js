import { useMemo } from 'react';
import { useSettlementStore } from '@/store/use-settlement-store';

/** Estado derivado del "modo hacer cuentas". */
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
    if (mins < 1) return 'recién';
    if (mins < 60) return `hace ${mins} min`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `hace ${hours} h`;
    const days = Math.round(hours / 24);
    return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
}
