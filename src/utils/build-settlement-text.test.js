import { describe, expect, it } from 'vitest';
import { buildSettlementEntityText, buildSettlementSnapshotText } from './build-settlement-text';

const item = (overrides = {}) => ({
    name: 'Gasto',
    amount_per_quota: 10,
    currency: 'ARS',
    type: 'EGRESO',
    entity_name: 'Juan',
    ...overrides,
});

const ITEMS_JUAN = [
    item({ name: 'Netflix', amount_per_quota: 100, fixed_expense: true }),
    item({ name: 'Préstamo', amount_per_quota: 250.5, quota_number: 2, number_of_quotas: 6 }),
    item({ name: 'Sueldo', amount_per_quota: 50, type: 'INGRESO' }),
    item({ name: 'Viaje', amount_per_quota: 20, currency: 'USD', quota_number: 3 }),
    item({ name: 'Varios', amount_per_quota: 10, currency: 'USD' }),
];

describe('buildSettlementEntityText', () => {
    it('separa pagado y cobrado por moneda, con el detalle de cada gasto y sus totales', () => {
        expect(buildSettlementEntityText('Juan', ITEMS_JUAN)).toBe(
            [
                'Juan:',
                '',
                '*Pagado (ARS):*',
                '',
                'Netflix: 100.00 ARS',
                'Gasto fijo',
                '',
                'Préstamo: 250.50 ARS',
                'Cuota 2/6',
                '',
                '*Total pagado:* 350.50 ARS',
                '',
                '*Cobrado (ARS):*',
                '',
                'Sueldo: 50.00 ARS',
                'Cobro',
                '',
                '*Total cobrado:* 50.00 ARS',
                '',
                '*Pagado (USD):*',
                '',
                'Viaje: 20.00 USD',
                'Cuota 3',
                '',
                'Varios: 10.00 USD',
                'Pago',
                '',
                '*Total pagado:* 30.00 USD',
            ].join('\n'),
        );
    });

    it('describe un ingreso fijo como «Ingreso fijo»', () => {
        const text = buildSettlementEntityText('Ana', [
            item({ name: 'Alquiler', type: 'INGRESO', fixed_expense: true }),
        ]);

        expect(text).toContain('Alquiler: 10.00 ARS\nIngreso fijo');
    });
});

describe('buildSettlementSnapshotText', () => {
    it('arma título, fechas, bloques por entidad, totales del mes con el neto y el conteo', () => {
        const snapshot = {
            started_at: '2026-11-01T12:00:00Z',
            finished_at: '2026-11-10T12:00:00Z',
            items: ITEMS_JUAN,
            totals: {
                byCurrency: {
                    ARS: { egreso: 350.5, ingreso: 50 },
                    USD: { egreso: 30, ingreso: 0 },
                },
                items: 5,
                entities: 1,
            },
        };

        const text = buildSettlementSnapshotText(snapshot, 'noviembre de 2026');

        expect(text.startsWith('*Cuentas de noviembre de 2026*\n01/11/2026 → 10/11/2026\n')).toBe(
            true,
        );
        expect(text).toContain(buildSettlementEntityText('Juan', ITEMS_JUAN));
        expect(text).toContain('*TOTALES DEL MES*');
        expect(text).toContain('ARS: pagado 350.50 · cobrado 50.00 · neto -300.50');
        expect(text).toContain('USD: pagado 30.00 · cobrado 0.00 · neto -30.00');
        expect(text.endsWith('5 gastos · 1 entidades')).toBe(true);
    });

    it('sin totals no muestra los totales del mes y cuenta gastos y entidades de los ítems', () => {
        const snapshot = {
            items: [
                item({ name: 'Cena', entity_name: 'Juan' }),
                item({ name: 'Taxi', entity_name: 'Ana' }),
            ],
        };

        const text = buildSettlementSnapshotText(snapshot, 'octubre de 2026');

        expect(text.startsWith('*Cuentas de octubre de 2026*\n\nJuan:')).toBe(true);
        expect(text).toContain('Ana:');
        expect(text).not.toContain('TOTALES DEL MES');
        expect(text.endsWith('2 gastos · 2 entidades')).toBe(true);
    });
});
