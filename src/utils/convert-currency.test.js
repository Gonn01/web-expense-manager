import { describe, expect, it } from 'vitest';

import { convertCurrency } from '@/utils/convert-currency';

const rates = { USD: 1000, EUR: 1100, BRL: 200 };

describe('convertCurrency', () => {
    describe('camino feliz', () => {
        it('convierte de una moneda extranjera a ARS multiplicando por la cotización', () => {
            expect(convertCurrency(50, 'USD', 'ARS', rates)).toBe(50000);
        });

        it('convierte de ARS a una moneda extranjera dividiendo por la cotización', () => {
            expect(convertCurrency(25000, 'ARS', 'USD', rates)).toBe(25);
        });

        it('convierte entre dos monedas extranjeras pasando por ARS', () => {
            expect(convertCurrency(11, 'EUR', 'USD', rates)).toBeCloseTo(12.1);
        });

        it('devuelve el mismo monto si la moneda de origen y destino coinciden', () => {
            expect(convertCurrency(123.45, 'USD', 'USD', rates)).toBe(123.45);
        });
    });

    describe('casos de borde y error', () => {
        it('devuelve null si todavía no se cargaron las cotizaciones', () => {
            expect(convertCurrency(100, 'USD', 'ARS', null)).toBeNull();
            expect(convertCurrency(100, 'USD', 'ARS', undefined)).toBeNull();
        });

        it('devuelve null si falta la cotización de la moneda de origen', () => {
            expect(convertCurrency(100, 'CLP', 'ARS', rates)).toBeNull();
        });

        it('devuelve null si falta la cotización de la moneda de destino', () => {
            expect(convertCurrency(100, 'USD', 'UYU', rates)).toBeNull();
        });

        it('convierte un monto en cero sin perder el resultado', () => {
            expect(convertCurrency(0, 'USD', 'ARS', rates)).toBe(0);
        });

        it('no necesita cotizaciones cuando no hay conversión que hacer', () => {
            expect(convertCurrency(100, 'ARS', 'ARS', null)).toBe(100);
        });
    });
});
