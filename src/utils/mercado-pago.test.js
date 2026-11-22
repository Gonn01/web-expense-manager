import { describe, expect, it } from 'vitest';
import { isValidMercadoPagoAlias } from './mercado-pago';

describe('isValidMercadoPagoAlias', () => {
    it('acepta letras, números, puntos y guiones', () => {
        expect(isValidMercadoPagoAlias(' mi.alias-01 ')).toBe(true);
    });

    it('acepta vacío para poder quitar el alias', () => {
        expect(isValidMercadoPagoAlias('   ')).toBe(true);
        expect(isValidMercadoPagoAlias(null)).toBe(true);
    });

    it.each(['corto', 'a'.repeat(21), 'con espacio', 'muñeca.azul'])('rechaza %s', (value) => {
        expect(isValidMercadoPagoAlias(value)).toBe(false);
    });
});
