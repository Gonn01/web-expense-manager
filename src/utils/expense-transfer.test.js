import { describe, expect, it } from 'vitest';

import {
    SHARED_ENTITY_TRANSFER_REASON,
    transferBlockReason,
    transferTargets,
} from '@/utils/expense-transfer';

const entities = [
    { id: 1, name: 'Banco', linked_user_id: null },
    { id: 2, name: 'Juan', linked_user_id: null },
    { id: 3, name: 'Compartida', linked_user_id: 99 },
    { id: 4, name: 'Tarjeta', linked_user_id: null },
];

describe('transferBlockReason', () => {
    it('permite transferir un gasto de una entidad propia sin bloqueos', () => {
        const gasto = { financial_entity_id: 1 };
        expect(transferBlockReason(gasto, entities)).toBeNull();
    });

    it('bloquea la transferencia si la entidad está vinculada con otro usuario', () => {
        const gasto = { financial_entity_id: 3 };
        expect(transferBlockReason(gasto, entities)).toBe(SHARED_ENTITY_TRANSFER_REASON);
    });

    it('prioriza el motivo de bloqueo que informa el backend', () => {
        const gasto = {
            financial_entity_id: 1,
            edit_locks: { financial_entity_id: 'El gasto tiene pagos en una sesión abierta.' },
        };
        expect(transferBlockReason(gasto, entities)).toBe(
            'El gasto tiene pagos en una sesión abierta.',
        );
    });

    it('devuelve null si no hay gasto', () => {
        expect(transferBlockReason(null, entities)).toBeNull();
    });
});

describe('transferTargets', () => {
    it('ofrece como destino solo las entidades propias distintas de la actual', () => {
        const gasto = { financial_entity_id: 1 };
        expect(transferTargets(gasto, entities).map((e) => e.id)).toEqual([2, 4]);
    });

    it('excluye la entidad vinculada al gasto aunque el id llegue como texto', () => {
        const gasto = { financial_entity_id: '1', linked_financial_entity_id: '4' };
        expect(transferTargets(gasto, entities).map((e) => e.id)).toEqual([2]);
    });

    it('devuelve una lista vacía si no hay entidades', () => {
        expect(transferTargets({ financial_entity_id: 1 }, [])).toEqual([]);
    });
});
