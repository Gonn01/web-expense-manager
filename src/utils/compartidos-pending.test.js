import { describe, expect, it } from 'vitest';
import { countGastosPorResolver, countPagosByPurchase } from './compartidos-pending';

describe('countPagosByPurchase', () => {
    it('cuenta los pagos pendientes de cada gasto', () => {
        const counts = countPagosByPurchase([
            { purchase_id: 1 },
            { purchase_id: 2 },
            { purchase_id: 1 },
        ]);

        expect(counts.get(1)).toBe(2);
        expect(counts.get(2)).toBe(1);
    });

    it('devuelve un mapa vacío si no hay pagos', () => {
        expect(countPagosByPurchase().size).toBe(0);
    });
});

describe('countGastosPorResolver', () => {
    it('cuenta los recibidos pendientes y los emitidos rechazados', () => {
        const count = countGastosPorResolver({
            recibidos: [{ status: 'PENDING_APPROVAL' }, { status: 'REJECTED' }],
            emitidos: [{ copy_status: 'REJECTED' }, { copy_status: 'PENDING_APPROVAL' }],
        });

        expect(count).toBe(2);
    });

    it('devuelve 0 si no hay datos', () => {
        expect(countGastosPorResolver({})).toBe(0);
    });
});
