import { describe, expect, it } from 'vitest';
import {
    buildNotification,
    linkedEntityToUnlink,
    mergeFirstPage,
    navBadgeCount,
} from './notifications';

const EVENTS = [
    'compartido.nuevo',
    'compartido.aprobado',
    'compartido.rechazado',
    'compartido.descartado',
    'compartido.desvinculado',
    'pago.pendiente',
    'pago.confirmado',
    'pago.rechazado',
    'pago.retirado',
    'pago.reversion_solicitada',
    'pago.reversion_cancelada',
    'pago.reversion_aceptada',
    'pago.reversion_rechazada',
    'edicion.solicitada',
    'edicion.cancelada',
    'edicion.aprobada',
    'edicion.rechazada',
    'entidad.vinculada',
    'entidad.desvinculada',
    'gasto.postergado',
    'gasto.postergacion_quitada',
];

describe('buildNotification', () => {
    it.each(EVENTS)('arma texto e ícono para %s', (event) => {
        const result = buildNotification(event, {
            actorName: 'Ana',
            receiverName: 'Luz',
            gastoName: 'Alquiler',
        });
        expect(result.message).toBeTruthy();
        expect(result.message).not.toContain('{{');
        expect(result.icon).toBeTruthy();
    });

    it('usa un texto genérico si no sabe quién actuó', () => {
        expect(buildNotification('entidad.desvinculada', {}).message).toContain('La otra persona');
    });

    it('devuelve null para un evento desconocido', () => {
        expect(buildNotification('otro.evento', {})).toBeNull();
    });
});

describe('navBadgeCount', () => {
    it('no suma dos veces lo pendiente y lo no leído', () => {
        expect(navBadgeCount(2, 3)).toBe(3);
        expect(navBadgeCount(4, 1)).toBe(4);
    });
});

describe('linkedEntityToUnlink', () => {
    const notification = { event: 'entidad.desvinculada', data: { entityId: '7', actorId: 2 } };

    it('encuentra la entidad propia que sigue vinculada a quien avisó', () => {
        const entity = { id: 7, linked_user_id: '2' };
        expect(linkedEntityToUnlink(notification, [entity])).toBe(entity);
    });

    it('no ofrece nada si ya se desvinculó o apunta a otra persona', () => {
        expect(linkedEntityToUnlink(notification, [{ id: 7, linked_user_id: null }])).toBeNull();
        expect(linkedEntityToUnlink(notification, [{ id: 7, linked_user_id: 3 }])).toBeNull();
    });

    it('solo aplica a la desvinculación', () => {
        expect(
            linkedEntityToUnlink({ ...notification, event: 'entidad.vinculada' }, [
                { id: 7, linked_user_id: 2 },
            ]),
        ).toBeNull();
    });
});

describe('mergeFirstPage', () => {
    const item = (id, extra = {}) => ({ id: String(id), ...extra });

    it('conserva las páginas ya cargadas al llegar una notificación', () => {
        const current = [item(5), item(4), item(3), item(2)];
        const result = mergeFirstPage(current, '2', {
            items: [item(6), item(5), item(4)],
            next_before: '4',
        });
        expect(result.items.map((i) => i.id)).toEqual(['6', '5', '4', '3', '2']);
        expect(result.nextBefore).toBe('2');
    });

    it('reemplaza la lista si quedó un hueco', () => {
        const result = mergeFirstPage([item(2), item(1)], null, {
            items: [item(9), item(8)],
            next_before: '8',
        });
        expect(result.items.map((i) => i.id)).toEqual(['9', '8']);
        expect(result.nextBefore).toBe('8');
    });

    it('usa la página completa si no hay más', () => {
        const result = mergeFirstPage([item(1)], null, {
            items: [item(2), item(1)],
            next_before: null,
        });
        expect(result.items).toHaveLength(2);
        expect(result.nextBefore).toBeNull();
    });
});
