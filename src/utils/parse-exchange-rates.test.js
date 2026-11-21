import { describe, expect, it } from 'vitest';

import { parseExchangeRates } from '@/utils/parse-exchange-rates';

const buildPayload = (detalle) => ({ status: 200, results: { fecha: '2026-11-20', detalle } });

describe('parseExchangeRates', () => {
    it('toma tipoCotizacion de cada moneda extranjera soportada', () => {
        const payload = buildPayload([
            { codigoMoneda: 'ARS', tipoCotizacion: 0 },
            { codigoMoneda: 'USD', tipoCotizacion: 1580 },
            { codigoMoneda: 'EUR', tipoCotizacion: 1733.734 },
            { codigoMoneda: 'BRL', tipoCotizacion: 265.975355 },
            { codigoMoneda: 'CLP', tipoCotizacion: 1.546518 },
            { codigoMoneda: 'UYU', tipoCotizacion: 38.892308 },
            { codigoMoneda: 'GBP', tipoCotizacion: 2069.8 },
        ]);

        expect(parseExchangeRates(payload)).toMatchObject({
            USD: 1580,
            EUR: 1733.734,
            BRL: 265.975355,
            CLP: 1.546518,
            UYU: 38.892308,
            GBP: 2069.8,
        });
    });

    it('traduce los códigos propios del BCRA a los códigos ISO', () => {
        const rates = parseExchangeRates(
            buildPayload([
                { codigoMoneda: 'MXP', tipoCotizacion: 83.02331 },
                { codigoMoneda: 'VEB', tipoCotizacion: 1.73198649 },
            ]),
        );

        expect(rates.MXN).toBe(83.02331);
        expect(rates.VES).toBe(1.73198649);
    });

    it('lleva el dong a valor por unidad porque el BCRA lo cotiza cada 1.000', () => {
        const rates = parseExchangeRates(
            buildPayload([{ codigoMoneda: 'VND', tipoCotizacion: 61.278312 }]),
        );

        expect(rates.VND).toBeCloseTo(0.061278312, 9);
    });

    it('no incorpora referencias ni metales como monedas', () => {
        const rates = parseExchangeRates(
            buildPayload([
                { codigoMoneda: 'REF', tipoCotizacion: 1575.9572 },
                { codigoMoneda: 'XAU', tipoCotizacion: 0 },
                { codigoMoneda: 'XAG', tipoCotizacion: 0 },
            ]),
        );

        expect(rates).not.toHaveProperty('REF');
        expect(rates).not.toHaveProperty('XAU');
        expect(rates).not.toHaveProperty('XAG');
    });

    it('no usa REF como cotización del dólar', () => {
        const payload = buildPayload([{ codigoMoneda: 'REF', tipoCotizacion: 1575.9572 }]);

        expect(parseExchangeRates(payload).USD).toBeNull();
    });

    it('devuelve null si la cotización es cero o no es numérica', () => {
        const payload = buildPayload([
            { codigoMoneda: 'USD', tipoCotizacion: 0 },
            { codigoMoneda: 'EUR', tipoCotizacion: '1733' },
        ]);

        const rates = parseExchangeRates(payload);

        expect(rates.USD).toBeNull();
        expect(rates.EUR).toBeNull();
    });

    it('falla si la respuesta no trae el detalle', () => {
        expect(() => parseExchangeRates({ status: 500 })).toThrow();
        expect(() => parseExchangeRates(null)).toThrow();
    });
});
