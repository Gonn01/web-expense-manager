import { describe, expect, it } from 'vitest';
import {
    ENTITY_STARTS_COLLAPSED,
    addCreatedToGroups,
    buildDashboardGroups,
    changePendingCount,
    filterDashboardGroups,
    keepsGroupOnDashboard,
} from './dashboard-groups';
import { pendingApprovalLabel } from './pending-approval-text';

const gasto = (overrides = {}) => ({
    id: 10,
    name: 'Préstamo',
    amount: 1000,
    amount_per_quota: 100,
    number_of_quotas: 10,
    payed_quotas: 2,
    currency_type: 'ARS',
    type: 'EGRESO',
    fixed_expense: false,
    created_at: '2026-03-01T10:00:00Z',
    ...overrides,
});

const soloPendientes = {
    id: 1,
    name: 'Juan',
    is_favorite: false,
    created_at: '2026-01-01T00:00:00Z',
    pending_count: 1,
    gastos: [],
};
const conGastos = {
    id: 2,
    name: 'Banco',
    is_favorite: false,
    created_at: '2026-01-01T00:00:00Z',
    pending_count: 0,
    gastos: [gasto()],
};
const vacia = {
    id: 3,
    name: 'Vacía',
    is_favorite: false,
    created_at: '2026-01-01T00:00:00Z',
    pending_count: 0,
    gastos: [],
};
const favoritaVacia = { ...vacia, id: 4, name: 'Favorita', is_favorite: true };

const ids = (groups) => groups.map((g) => g.id);

describe('buildDashboardGroups', () => {
    it('conserva una entidad con 0 gastos activos y pending_count = 1', () => {
        const groups = buildDashboardGroups([soloPendientes]);
        expect(ids(groups)).toEqual([1]);
        expect(groups[0].items).toEqual([]);
        expect(groups[0].pending_count).toBe(1);
    });

    it('descarta una entidad sin gastos, sin pendientes y no favorita', () => {
        expect(ids(buildDashboardGroups([vacia, conGastos, favoritaVacia]))).toEqual(
            expect.arrayContaining([2, 4]),
        );
        expect(ids(buildDashboardGroups([vacia]))).toEqual([]);
    });
});

describe('keepsGroupOnDashboard', () => {
    it('mantiene el grupo si se queda sin gastos pero tiene pendientes', () => {
        expect(keepsGroupOnDashboard({ items: [], pending_count: 2 })).toBe(true);
        expect(keepsGroupOnDashboard({ items: [], pending_count: 0 })).toBe(false);
    });
});

describe('filterDashboardGroups', () => {
    const groups = buildDashboardGroups([soloPendientes, conGastos]);

    it('sin filtros muestra la entidad que solo tiene pendientes', () => {
        expect(ids(filterDashboardGroups(groups))).toEqual(expect.arrayContaining([1, 2]));
    });

    it('los filtros de moneda, tipo y frecuencia no la ocultan', () => {
        const visibles = filterDashboardGroups(groups, {
            currency: 'USD',
            typeFilter: 'INGRESO',
            fixedFilter: true,
        });
        expect(ids(visibles)).toEqual([1]);
    });

    it('el modo hacer cuentas no la oculta', () => {
        expect(ids(filterDashboardGroups(groups, { settlementActive: true }))).toContain(1);
    });

    it('el buscador la muestra solo si coincide el nombre de la entidad', () => {
        expect(ids(filterDashboardGroups(groups, { query: 'jua' }))).toEqual([1]);
        expect(ids(filterDashboardGroups(groups, { query: 'préstamo' }))).toEqual([2]);
    });
});

describe('addCreatedToGroups', () => {
    const entity = { id: 1, name: 'Juan', is_favorite: false, pending_count: 0 };
    const getEntityById = (id) => (String(id) === '1' ? entity : null);

    it('un gasto pendiente en una entidad que no está agrega su grupo', () => {
        const next = addCreatedToGroups(
            [],
            gasto({ status: 'PENDING_APPROVAL', financial_entity_id: 1 }),
            getEntityById,
        );
        expect(ids(next)).toEqual([1]);
        expect(next[0].items).toEqual([]);
        expect(next[0].pending_count).toBe(1);
    });

    it('un gasto pendiente en una entidad existente suma al contador sin agregar items', () => {
        const groups = buildDashboardGroups([soloPendientes]);
        const next = addCreatedToGroups(
            groups,
            gasto({ status: 'PENDING_APPROVAL', financial_entity_id: 1 }),
            getEntityById,
        );
        expect(next[0].pending_count).toBe(2);
        expect(next[0].items).toEqual([]);
    });
});

describe('changePendingCount', () => {
    it('resta al responder y no baja de cero', () => {
        const groups = buildDashboardGroups([soloPendientes]);
        expect(changePendingCount(groups, 1, -1)[0].pending_count).toBe(0);
        expect(changePendingCount(groups, 1, -5)[0].pending_count).toBe(0);
    });
});

describe('pendingApprovalLabel', () => {
    it('usa singular y plural', () => {
        expect(pendingApprovalLabel(1)).toBe('1 gasto esperando respuesta');
        expect(pendingApprovalLabel(3)).toBe('3 gastos esperando respuesta');
    });
});

describe('estado inicial de las entidades del dashboard', () => {
    it('arrancan cerradas al entrar', () => {
        expect(ENTITY_STARTS_COLLAPSED).toBe(true);
    });
});
