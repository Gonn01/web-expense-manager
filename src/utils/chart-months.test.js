import { describe, expect, it } from 'vitest';
import {
    fixedExpenseStartMonth,
    hasChartData,
    keyFromMonthIndex,
    pendingQuotaMonths,
} from './chart-months';

const NOVIEMBRE_2026 = 2026 * 12 + 10;

const cuotas = (overrides = {}) => ({
    fixed_expense: false,
    number_of_quotas: 3,
    payed_quotas: 1,
    ...overrides,
});

const meses = (range) => ({
    start: keyFromMonthIndex(range.start),
    end: keyFromMonthIndex(range.end),
});

describe('pendingQuotaMonths', () => {
    it('un gasto normal empieza en el mes actual, igual que antes', () => {
        expect(meses(pendingQuotaMonths(cuotas(), NOVIEMBRE_2026))).toEqual({
            start: '2026-11',
            end: '2026-12',
        });
    });

    it('un gasto postergado corre sus cuotas pendientes un mes adelante', () => {
        expect(meses(pendingQuotaMonths(cuotas({ is_postponed: true }), NOVIEMBRE_2026))).toEqual({
            start: '2026-12',
            end: '2027-01',
        });
    });

    it('3 cuotas con la primera pagada y la de noviembre postergada: diciembre y enero', () => {
        const gasto = cuotas({
            amount: 30000,
            amount_per_quota: 10000,
            first_quota_date: '2026-10-05',
            is_postponed: true,
        });

        expect(meses(pendingQuotaMonths(gasto, NOVIEMBRE_2026))).toEqual({
            start: '2026-12',
            end: '2027-01',
        });
    });

    it('con is_postponed en false o ausente no corre nada', () => {
        const esperado = { start: '2026-11', end: '2026-12' };
        expect(meses(pendingQuotaMonths(cuotas({ is_postponed: false }), NOVIEMBRE_2026))).toEqual(
            esperado,
        );
        expect(meses(pendingQuotaMonths(cuotas(), NOVIEMBRE_2026))).toEqual(esperado);
    });

    it('el corrimiento se aplica después de calcular el inicio por la primera cuota', () => {
        const gasto = cuotas({
            number_of_quotas: 6,
            payed_quotas: 2,
            first_quota_date: '2026-11-01',
            is_postponed: true,
        });

        expect(meses(pendingQuotaMonths(gasto, NOVIEMBRE_2026))).toEqual({
            start: '2027-02',
            end: '2027-05',
        });
    });

    it('sigue sin devolver rango para fijos o gastos sin cuotas pendientes', () => {
        expect(
            pendingQuotaMonths({ fixed_expense: true, is_postponed: true }, NOVIEMBRE_2026),
        ).toBe(null);
        expect(
            pendingQuotaMonths(cuotas({ payed_quotas: 3, is_postponed: true }), NOVIEMBRE_2026),
        ).toBe(null);
    });
});

describe('fixedExpenseStartMonth', () => {
    it('un fijo normal cuenta desde el mes actual', () => {
        expect(
            keyFromMonthIndex(fixedExpenseStartMonth({ fixed_expense: true }, NOVIEMBRE_2026)),
        ).toBe('2026-11');
    });

    it('un fijo postergado no cuenta en el mes actual y empieza el mes siguiente', () => {
        expect(
            keyFromMonthIndex(
                fixedExpenseStartMonth({ fixed_expense: true, is_postponed: true }, NOVIEMBRE_2026),
            ),
        ).toBe('2026-12');
    });
});

describe('hasChartData', () => {
    it('sin gastos no hay nada para graficar', () => {
        expect(hasChartData([], NOVIEMBRE_2026)).toBe(false);
    });

    it('un egreso alcanza para el gráfico de categorías, aunque sea fijo', () => {
        expect(
            hasChartData([{ type: 'EGRESO', fixed_expense: true, amount: 100 }], NOVIEMBRE_2026),
        ).toBe(true);
    });

    it('un ingreso con cuotas pendientes alcanza para los gráficos por mes', () => {
        expect(
            hasChartData(
                [{ type: 'INGRESO', number_of_quotas: 3, payed_quotas: 1 }],
                NOVIEMBRE_2026,
            ),
        ).toBe(true);
    });

    it('solo ingresos sin cuotas pendientes no tienen datos', () => {
        expect(
            hasChartData(
                [
                    { type: 'INGRESO', number_of_quotas: 2, payed_quotas: 2 },
                    { type: 'INGRESO', fixed_expense: true, amount: 100 },
                ],
                NOVIEMBRE_2026,
            ),
        ).toBe(false);
    });
});
