import { describe, expect, it } from 'vitest';

import { inDateRange, isInvertedRange, orderedRange } from '@/utils/date-range';

describe('isInvertedRange', () => {
    it('detecta un desde posterior al hasta', () => {
        expect(isInvertedRange('2026-02-01', '2026-01-01')).toBe(true);
    });

    it('acepta un rango normal o de un solo día', () => {
        expect(isInvertedRange('2026-01-01', '2026-02-01')).toBe(false);
        expect(isInvertedRange('2026-01-01', '2026-01-01')).toBe(false);
    });

    it('no considera invertido un rango incompleto', () => {
        expect(isInvertedRange('', '2026-01-01')).toBe(false);
        expect(isInvertedRange('2026-01-01', null)).toBe(false);
    });
});

describe('orderedRange', () => {
    it('da vuelta un rango invertido', () => {
        expect(orderedRange('2026-02-01', '2026-01-01')).toEqual({
            from: '2026-01-01',
            to: '2026-02-01',
        });
    });

    it('deja igual un rango correcto', () => {
        expect(orderedRange('2026-01-01', '2026-02-01')).toEqual({
            from: '2026-01-01',
            to: '2026-02-01',
        });
    });
});

describe('inDateRange', () => {
    it('incluye el primer instante del día inicial', () => {
        expect(inDateRange('2026-03-10T00:00:00', '2026-03-10', '2026-03-12')).toBe(true);
    });

    it('incluye el último instante del día final', () => {
        expect(inDateRange('2026-03-12T23:59:59.999', '2026-03-10', '2026-03-12')).toBe(true);
    });

    it('excluye el instante anterior y el posterior al rango', () => {
        expect(inDateRange('2026-03-09T23:59:59.999', '2026-03-10', '2026-03-12')).toBe(false);
        expect(inDateRange('2026-03-13T00:00:00', '2026-03-10', '2026-03-12')).toBe(false);
    });

    it('funciona con el rango invertido', () => {
        expect(inDateRange('2026-03-11T12:00:00', '2026-03-12', '2026-03-10')).toBe(true);
    });

    it('sin límites acepta cualquier fecha válida', () => {
        expect(inDateRange('2026-03-11T12:00:00', '', '')).toBe(true);
    });

    it('aplica un solo límite', () => {
        expect(inDateRange('2026-03-11T12:00:00', '2026-03-12', '')).toBe(false);
        expect(inDateRange('2026-03-11T12:00:00', '', '2026-03-12')).toBe(true);
    });

    it('rechaza una fecha inválida', () => {
        expect(inDateRange('no-es-fecha', '', '')).toBe(false);
    });
});
