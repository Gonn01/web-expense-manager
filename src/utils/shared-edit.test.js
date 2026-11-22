import { describe, expect, it } from 'vitest';
import { describeSharedEdit, sharedEditChanges } from './shared-edit';

const gasto = {
    name: 'Cena',
    amount: 1000,
    currency_type: 'ARS',
    type: 'EGRESO',
    fixed_expense: false,
    number_of_quotas: 2,
};

describe('sharedEditChanges', () => {
    it('devuelve null si no cambia ningún dato que requiera aprobación', () => {
        expect(sharedEditChanges(gasto, { ...gasto, name: ' Cena ' })).toBeNull();
    });

    it('el nombre requiere aprobación', () => {
        expect(sharedEditChanges(gasto, { ...gasto, name: ' Almuerzo ' })).toEqual({
            name: 'Almuerzo',
        });
    });

    it('devuelve solo los datos que cambian', () => {
        expect(sharedEditChanges(gasto, { ...gasto, amount: 1500, number_of_quotas: 3 })).toEqual({
            amount: 1500,
            number_of_quotas: 3,
        });
    });

    it('al pasar a fijo no pide cambiar las cuotas', () => {
        expect(
            sharedEditChanges(gasto, { ...gasto, fixed_expense: true, number_of_quotas: 9 }),
        ).toEqual({ fixed_expense: true });
    });
});

describe('describeSharedEdit', () => {
    it('describe el cambio de nombre en una solicitud', () => {
        expect(describeSharedEdit({ name: 'Almuerzo' }, { gasto_name: 'Cena' })).toEqual([
            'Nombre: "Cena" → "Almuerzo"',
        ]);
    });

    it('describe el cambio de frecuencia', () => {
        expect(describeSharedEdit({ number_of_quotas: 3 }, gasto)).toEqual([
            'Frecuencia: En cuotas (2) → En cuotas (3)',
        ]);
    });
});
