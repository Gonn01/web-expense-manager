import { describe, expect, it } from 'vitest';
import { filteredCopyWarning, hiddenSummaryCount } from './copy-summary';

const full = {
    items: [{ id: 1 }, { id: 2 }, { id: 3, is_postponed: true }],
};

describe('hiddenSummaryCount', () => {
    it('cuenta los gastos que el filtro dejó afuera', () => {
        expect(hiddenSummaryCount(full, { items: [{ id: 1 }] })).toBe(1);
    });

    it('no cuenta los postergados, que nunca entran en el resumen', () => {
        expect(hiddenSummaryCount(full, { items: [{ id: 1 }, { id: 2 }] })).toBe(0);
    });
});

describe('filteredCopyWarning', () => {
    it('no avisa si no quedó nada afuera', () => {
        expect(filteredCopyWarning(0)).toBeNull();
    });

    it('avisa cuántos gastos quedaron afuera', () => {
        expect(filteredCopyWarning(2)).toContain('2 gastos');
    });
});
