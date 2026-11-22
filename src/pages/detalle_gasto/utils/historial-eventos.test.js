import { describe, expect, it } from 'vitest';
import { eventDate, eventTitle, filterEventsByDate, paymentNumbers } from './historial-eventos';

const creacion = { id: 1, movement_type: 'CREATION', created_at: '2026-03-01T10:00:00' };
const pago = {
    id: 2,
    movement_type: 'PAYMENT',
    payment_date: '2026-03-10T23:30:00',
    created_at: '2026-04-20T09:00:00',
};
const pagoSinFecha = { id: 3, movement_type: 'PAYMENT', created_at: '2026-03-15T12:00:00' };
const edicion = { id: 4, movement_type: 'EDITED', created_at: '2026-03-31T23:59:59' };
const reembolso = {
    id: 5,
    movement_type: 'REFUND',
    payment_date: '2026-05-02T08:00:00',
    created_at: '2026-03-05T08:00:00',
};

const movimientos = [creacion, pago, pagoSinFecha, edicion, reembolso];
const ids = (list) => list.map((m) => m.id);

describe('eventDate', () => {
    it('usa payment_date en los eventos de pago', () => {
        expect(eventDate(pago)).toBe(pago.payment_date);
        expect(eventDate(reembolso)).toBe(reembolso.payment_date);
    });

    it('usa created_at en un pago sin payment_date', () => {
        expect(eventDate(pagoSinFecha)).toBe(pagoSinFecha.created_at);
    });

    it('usa created_at en los eventos que no son pagos', () => {
        expect(eventDate(creacion)).toBe(creacion.created_at);
    });

    it('muestra el envío en su fecha y la aprobación en la fecha en que se resolvió', () => {
        const fechas = { payment_date: '2026-11-10T10:00:00', created_by_user_id: 2 };
        const enviado = {
            ...fechas,
            movement_type: 'PAYMENT_REQUESTED',
            created_at: '2026-11-10T10:00:00',
        };
        const aprobado = {
            ...fechas,
            movement_type: 'PAYMENT',
            created_at: '2026-11-12T18:00:00',
        };
        const rechazado = { ...aprobado, movement_type: 'PAYMENT_REJECTED' };

        expect(eventDate(enviado)).toBe('2026-11-10T10:00:00');
        expect(eventDate(aprobado)).toBe('2026-11-12T18:00:00');
        expect(eventDate(rechazado)).toBe('2026-11-12T18:00:00');
    });
});

describe('paymentNumbers', () => {
    it('la línea histórica toma la cuota de su pago y no cuenta como otra cuota', () => {
        const numbers = paymentNumbers([
            { id: 10, movement_type: 'PAYMENT', payment_date: '2026-11-10T10:00:00' },
            {
                id: 11,
                movement_type: 'PAYMENT_REQUESTED',
                payment_date: '2026-11-10T10:00:00',
                paired_movement_id: 10,
            },
            { id: 12, movement_type: 'PENDING_PAYMENT', payment_date: '2026-11-11T10:00:00' },
            { id: 13, movement_type: 'REVERSAL_REQUESTED', paired_movement_id: 10 },
        ]);

        expect([...numbers.entries()].sort(([a], [b]) => a - b)).toEqual([
            [10, 1],
            [11, 1],
            [12, 2],
            [13, 1],
        ]);
    });
});

describe('eventTitle', () => {
    const gasto = { fixed_expense: false, number_of_quotas: 6 };

    it('nombra a quien hizo cada paso', () => {
        const enviado = { movement_type: 'PAYMENT_REQUESTED', created_by_user_id: 2 };

        expect(
            eventTitle(enviado, gasto, { number: 3, counterpartyName: 'María', currentUserId: 2 }),
        ).toBe('Cuota 3 de 6 · enviado por vos');
        expect(
            eventTitle(enviado, gasto, { number: 3, counterpartyName: 'María', currentUserId: 1 }),
        ).toBe('Cuota 3 de 6 · enviado por María');
    });

    it('muestra quién compartió el gasto según quién lo mira', () => {
        const compartido = { movement_type: 'SHARED_SENT', created_by_user_id: 2 };

        expect(eventTitle(compartido, gasto, { counterpartyName: 'María', currentUserId: 2 })).toBe(
            'Gasto compartido con María',
        );
        expect(eventTitle(compartido, gasto, { counterpartyName: 'María', currentUserId: 1 })).toBe(
            'María te compartió este gasto',
        );
    });

    it('muestra el pago recibido con su cuota solo cuando ya está confirmado', () => {
        const recibido = { movement_type: 'PAYMENT_RECEIVED', created_by_user_id: 2 };

        expect(eventTitle(recibido, gasto, { number: 3, counterpartyName: 'María' })).toBe(
            'Cuota 3 de 6 · recibido de María',
        );
        expect(eventTitle(recibido, gasto, { counterpartyName: 'María' })).toBe(
            'Pago recibido de María',
        );
    });
});

describe('filterEventsByDate', () => {
    it('devuelve todo sin rango', () => {
        expect(filterEventsByDate(movimientos, { from: '', to: '' })).toBe(movimientos);
        expect(filterEventsByDate(movimientos)).toBe(movimientos);
    });

    it('filtra un pago por payment_date y no por created_at', () => {
        expect(
            ids(filterEventsByDate(movimientos, { from: '2026-03-10', to: '2026-03-10' })),
        ).toEqual([2]);
        expect(
            ids(filterEventsByDate(movimientos, { from: '2026-04-20', to: '2026-04-20' })),
        ).toEqual([]);
    });

    it('incluye todo el día de «Hasta»', () => {
        expect(ids(filterEventsByDate(movimientos, { to: '2026-03-31' }))).toEqual([1, 2, 3, 4]);
    });

    it('incluye el día de «Desde» desde las 00:00', () => {
        expect(ids(filterEventsByDate(movimientos, { from: '2026-03-15' }))).toEqual([3, 4, 5]);
    });

    it('invierte el rango cuando «Desde» es posterior a «Hasta»', () => {
        const normal = filterEventsByDate(movimientos, { from: '2026-03-02', to: '2026-03-20' });
        const invertido = filterEventsByDate(movimientos, { from: '2026-03-20', to: '2026-03-02' });
        expect(ids(invertido)).toEqual(ids(normal));
        expect(ids(normal)).toEqual([2, 3]);
    });

    it('devuelve vacío si nada cae en el rango', () => {
        expect(filterEventsByDate(movimientos, { from: '2027-01-01', to: '2027-01-31' })).toEqual(
            [],
        );
    });

    it('descarta eventos sin fecha válida cuando hay rango', () => {
        const sinFecha = { id: 9, movement_type: 'EDITED', created_at: null };
        expect(ids(filterEventsByDate([sinFecha, creacion], { from: '2026-01-01' }))).toEqual([1]);
    });
});
