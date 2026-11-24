import { describe, expect, it } from 'vitest';
import {
    buildNotification,
    linkedEntityToUnlink,
    mergeFirstPage,
    notificationTarget,
    takeAnnounceable,
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

describe('notificationTarget', () => {
    it.each([
        'compartido.nuevo',
        'compartido.rechazado',
        'pago.pendiente',
        'pago.reversion_solicitada',
        'edicion.solicitada',
    ])('lleva a Compartidos si %s requiere una acción', (event) => {
        expect(notificationTarget({ event, data: { ownGastoId: 8 } }, [])).toBe('/app/compartidos');
    });

    it('lleva al gasto propio en los avisos informativos', () => {
        expect(notificationTarget({ event: 'pago.confirmado', data: { ownGastoId: 8 } }, [])).toBe(
            '/app/gastos/8',
        );
    });

    it('lleva a la entidad solo si sigue existiendo', () => {
        const notification = { event: 'entidad.vinculada', data: { entityId: '7' } };
        expect(notificationTarget(notification, [{ id: 7 }])).toBe('/app/entidades/7');
        expect(notificationTarget(notification, [])).toBeNull();
    });

    it('no navega si una notificación vieja no tiene el gasto propio', () => {
        expect(notificationTarget({ event: 'pago.confirmado', data: {} }, [])).toBeNull();
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

describe('takeAnnounceable', () => {
    it('devuelve las notificaciones esperadas de la más vieja a la más nueva', () => {
        const pending = new Set(['3', '5']);
        const items = [{ id: 5 }, { id: 4 }, { id: 3 }];

        expect(takeAnnounceable(pending, items).map((item) => item.id)).toEqual([3, 5]);
    });

    it('no anuncia dos veces la misma notificación', () => {
        const pending = new Set(['3']);
        const items = [{ id: 3 }];

        takeAnnounceable(pending, items);

        expect(takeAnnounceable(pending, items)).toEqual([]);
    });

    it('conserva la que todavía no llegó', () => {
        const pending = new Set(['3', '9']);

        takeAnnounceable(pending, [{ id: 3 }]);

        expect([...pending]).toEqual(['9']);
    });
});
