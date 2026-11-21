import { describe, expect, it } from 'vitest';
import { countGastosPorResolver } from './compartidos-pending';

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
