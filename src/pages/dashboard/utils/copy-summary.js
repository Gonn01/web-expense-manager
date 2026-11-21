const payable = (group) => (group?.items ?? []).filter((it) => !it.is_postponed);

export function hiddenSummaryCount(fullGroup, visibleGroup) {
    const visibleIds = new Set(payable(visibleGroup).map((it) => it.id));
    return payable(fullGroup).filter((it) => !visibleIds.has(it.id)).length;
}

export function filteredCopyWarning(hidden) {
    if (hidden <= 0) return null;
    return hidden === 1
        ? 'Copiado con filtros activos: quedó afuera 1 gasto.'
        : `Copiado con filtros activos: quedaron afuera ${hidden} gastos.`;
}
