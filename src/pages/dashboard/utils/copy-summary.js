import { t } from '@/i18n';

const payable = (group) => (group?.items ?? []).filter((it) => !it.is_postponed);

export function hiddenSummaryCount(fullGroup, visibleGroup) {
    const visibleIds = new Set(payable(visibleGroup).map((it) => it.id));
    return payable(fullGroup).filter((it) => !visibleIds.has(it.id)).length;
}

export function filteredCopyWarning(hidden) {
    if (hidden <= 0) return null;
    return hidden === 1
        ? t('dashboard.copiedWithActiveFilters1ExpenseWas')
        : t('dashboard.copiedFilteredMany', { count: hidden });
}
