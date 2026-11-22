import { describe, expect, it } from 'vitest';
import {
    countPendingResponses,
    pendingResponsesForEntity,
    pendingResponsesForGasto,
} from './pending-responses';

const shared = {
    compartidos: {
        recibidos: [
            { id: 10, sender_id: 7, status: 'PENDING_APPROVAL' },
            { id: 11, sender_id: 7, status: 'REJECTED' },
            { id: 12, sender_id: 8, status: 'PENDING_APPROVAL' },
        ],
    },
    pagos: {
        porConfirmar: [
            { movement_id: 100, sibling_purchase_id: 10 },
            { movement_id: 101, sibling_purchase_id: 20 },
        ],
    },
    reversiones: {
        porConfirmar: [{ movement_id: 200 }, { movement_id: 201 }, { movement_id: 202 }],
    },
    ediciones: { porConfirmar: [{ id: 300 }, { id: 301 }] },
};

describe('pendingResponsesForGasto', () => {
    it('devuelve solo lo que el usuario puede responder de ese gasto', () => {
        const gasto = {
            id: 10,
            pending_edit_request: { id: 301 },
            movements: [
                { id: 200, movement_type: 'PAYMENT', paired_movement_id: 900 },
                { id: 901, movement_type: 'PAYMENT', paired_movement_id: 201 },
                { id: 202, movement_type: 'REFUND', paired_movement_id: null },
            ],
        };

        const result = pendingResponsesForGasto(shared, gasto);

        expect(result.recibidos.map((r) => r.id)).toEqual([10]);
        expect(result.pagos.map((p) => p.movement_id)).toEqual([100]);
        expect(result.reversiones.map((r) => r.movement_id)).toEqual([200, 201]);
        expect(result.ediciones.map((e) => e.id)).toEqual([301]);
        expect(countPendingResponses(result)).toBe(5);
    });

    it('no incluye un gasto recibido ya rechazado', () => {
        const result = pendingResponsesForGasto(shared, { id: 11, movements: [] });
        expect(result.recibidos).toEqual([]);
    });

    it('sin gasto no hay nada para responder', () => {
        expect(countPendingResponses(pendingResponsesForGasto(shared, null))).toBe(0);
    });
});

describe('pendingResponsesForEntity', () => {
    it('devuelve los gastos pendientes enviados por el usuario vinculado', () => {
        const result = pendingResponsesForEntity(shared, { id: 1, linked_user_id: '7' });
        expect(result.recibidos.map((r) => r.id)).toEqual([10]);
        expect(countPendingResponses(result)).toBe(1);
    });

    it('una entidad sin vincular no tiene gastos para aprobar', () => {
        const result = pendingResponsesForEntity(shared, { id: 1, linked_user_id: null });
        expect(countPendingResponses(result)).toBe(0);
    });
});
