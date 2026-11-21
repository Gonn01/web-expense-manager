import { describe, expect, it } from 'vitest';

import {
    caretAfterSignificantChars,
    countSignificantChars,
    formatAmountInput,
    parseAmountInput,
} from '@/utils/amount-input';

describe('parseAmountInput', () => {
    it('quita los separadores de miles y usa punto decimal', () => {
        expect(parseAmountInput('1.234.567,89')).toBe('1234567.89');
    });

    it('descarta letras y símbolos', () => {
        expect(parseAmountInput('$ 1a2b3')).toBe('123');
    });

    it('descarta el signo negativo', () => {
        expect(parseAmountInput('-50')).toBe('50');
    });

    it('conserva solo la primera coma decimal', () => {
        expect(parseAmountInput('1,2,3')).toBe('1.23');
    });

    it('conserva una coma final mientras se escribe', () => {
        expect(parseAmountInput('12,')).toBe('12.');
    });

    it('devuelve vacío si no hay dígitos', () => {
        expect(parseAmountInput('abc')).toBe('');
    });
});

describe('formatAmountInput', () => {
    it.each([
        ['', ''],
        [null, ''],
        [undefined, ''],
        ['1000', '1.000'],
        ['1234567.89', '1.234.567,89'],
        ['12.', '12,'],
        ['0007', '7'],
        ['0', '0'],
        [1500, '1.500'],
    ])('formatea %s como "%s"', (value, expected) => {
        expect(formatAmountInput(value)).toBe(expected);
    });

    it('vuelve al mismo valor al parsear lo formateado', () => {
        expect(parseAmountInput(formatAmountInput('9876543.21'))).toBe('9876543.21');
    });
});

describe('posición del cursor', () => {
    it('cuenta dígitos y coma, sin los puntos de miles', () => {
        expect(countSignificantChars('1.234,5', 3)).toBe(2);
        expect(countSignificantChars('1.234,5', 7)).toBe(6);
    });

    it('ubica el cursor después de la cantidad pedida de caracteres', () => {
        expect(caretAfterSignificantChars('1.234', 2)).toBe(3);
    });

    it('queda al inicio con cero caracteres', () => {
        expect(caretAfterSignificantChars('1.234', 0)).toBe(0);
    });

    it('queda al final si se piden más caracteres de los que hay', () => {
        expect(caretAfterSignificantChars('12', 5)).toBe(2);
    });

    it('mantiene el cursor sobre el mismo dígito al reformatear', () => {
        const count = countSignificantChars('1234', 2);

        expect(caretAfterSignificantChars('1.234', count)).toBe(3);
    });
});
