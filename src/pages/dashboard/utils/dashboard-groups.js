import { ExpenseStatus } from '@/utils/enums';

export const ENTITY_STARTS_COLLAPSED = true;

const byFavThenDate = (aFav, bFav, aDate, bDate) => {
    if (Boolean(bFav) !== Boolean(aFav)) return bFav ? 1 : -1;
    return new Date(bDate) - new Date(aDate);
};

export const withProgress = (g) => {
    const paid = Number(g.payed_quotas) || 0;
    const total = Number(g.number_of_quotas) || 0;
    return {
        ...g,
        amount: Number(g.amount),
        amount_per_quota: Number(g.amount_per_quota),
        payed_quotas: paid,
        progress: g.fixed_expense
            ? 100
            : total > 0
              ? Math.min((paid / total) * 100, 100)
              : paid === 0
                ? 0
                : 100,
    };
};

export const sortItems = (items) =>
    items.sort((a, b) => byFavThenDate(a.is_favorite, b.is_favorite, a.created_at, b.created_at));

export const sortGroups = (groups) =>
    groups.sort((a, b) =>
        byFavThenDate(
            a.is_favorite,
            b.is_favorite,
            a.items[0]?.created_at ?? a.created_at,
            b.items[0]?.created_at ?? b.created_at,
        ),
    );

export const pendingCountOf = (group) => Number(group?.pending_count) || 0;

export const keepsGroupOnDashboard = (group) =>
    group.items.length > 0 || Boolean(group.is_favorite) || pendingCountOf(group) > 0;

export function buildDashboardGroups(entities) {
    const groups = entities
        .map((entity) => {
            const gastos = Array.isArray(entity.gastos) ? entity.gastos : [];
            return { ...entity, items: sortItems(gastos.map(withProgress)) };
        })
        .filter(keepsGroupOnDashboard);
    return sortGroups(groups);
}

export const isActiveOnDashboard = (g) =>
    g.status === ExpenseStatus.ACTIVE &&
    !g.deleted &&
    (g.fixed_expense || (Number(g.payed_quotas) || 0) < Number(g.number_of_quotas));

function groupFromEntity(entity, items, pendingCount) {
    return {
        id: entity.id,
        name: entity.name,
        is_favorite: entity.is_favorite,
        created_at: entity.created_at,
        pending_count: pendingCount,
        items,
    };
}

export function addCreatedToGroups(groups, gasto, getEntityById) {
    const entityId = String(gasto.financial_entity_id);
    const index = groups.findIndex((g) => String(g.id) === entityId);

    if (gasto.status === ExpenseStatus.PENDING_APPROVAL) {
        if (index >= 0) {
            return groups.map((g, i) =>
                i === index ? { ...g, pending_count: pendingCountOf(g) + 1 } : g,
            );
        }
        const entity = getEntityById(gasto.financial_entity_id);
        if (!entity) return null;
        return sortGroups([...groups, groupFromEntity(entity, [], pendingCountOf(entity) + 1)]);
    }

    if (!isActiveOnDashboard(gasto)) return groups;

    const item = withProgress(gasto);
    if (index >= 0) {
        return sortGroups(
            groups.map((g, i) =>
                i === index ? { ...g, items: sortItems([...g.items, item]) } : g,
            ),
        );
    }

    const entity = getEntityById(gasto.financial_entity_id);
    if (!entity) return null;
    return sortGroups([...groups, groupFromEntity(entity, [item], pendingCountOf(entity))]);
}

export function changePendingCount(groups, entityId, delta) {
    return groups.map((g) =>
        String(g.id) === String(entityId)
            ? { ...g, pending_count: Math.max(0, pendingCountOf(g) + delta) }
            : g,
    );
}

export function filterDashboardGroups(
    groups,
    {
        query = '',
        currency = null,
        typeFilter = null,
        fixedFilter = null,
        settlementActive = false,
    } = {},
) {
    const q = query.trim().toLowerCase();
    const sinFiltros = !q && currency === null && typeFilter === null && fixedFilter === null;

    return groups.flatMap((g) => {
        const matchEntityName = q ? g.name.toLowerCase().includes(q) : false;
        const items = g.items.filter((it) => {
            const matchTitle = q ? matchEntityName || it.name.toLowerCase().includes(q) : true;
            const matchCurrency = currency === null || it.currency_type === currency;
            const matchType = typeFilter === null || it.type === typeFilter;
            const matchFixed = fixedFilter === null || it.fixed_expense === fixedFilter;
            return matchTitle && matchCurrency && matchType && matchFixed;
        });
        const visible =
            items.length > 0 ||
            (pendingCountOf(g) > 0 && (!q || matchEntityName)) ||
            (Boolean(g.is_favorite) && sinFiltros && !settlementActive);
        return visible ? [{ ...g, items }] : [];
    });
}
