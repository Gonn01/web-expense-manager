import { describe, expect, it } from 'vitest';
import { eventDate, filterEventsByDate } from './historial-eventos';

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
