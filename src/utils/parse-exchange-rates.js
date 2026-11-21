import { Currency } from '@/utils/enums';

const FOREIGN_CURRENCIES = Object.values(Currency).filter((c) => c !== Currency.ARS);
const BCRA_CODES = { [Currency.MXN]: 'MXP', [Currency.VES]: 'VEB' };
const BCRA_QUOTED_UNITS = { [Currency.VND]: 1000 };

export function parseExchangeRates(payload) {
    const quotes = payload?.results?.detalle;
    if (!Array.isArray(quotes)) {
        throw new Error('Invalid exchange rates response');
    }

    return Object.fromEntries(
        FOREIGN_CURRENCIES.map((currency) => {
            const bcraCode = BCRA_CODES[currency] ?? currency;
            const rate = quotes.find((q) => q.codigoMoneda === bcraCode)?.tipoCotizacion;
            const units = BCRA_QUOTED_UNITS[currency] ?? 1;
            return [currency, Number.isFinite(rate) && rate > 0 ? rate / units : null];
        }),
    );
}
