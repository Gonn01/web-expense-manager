import { Currency } from '@/utils/enums';

export function convertCurrency(amount, from, to, rates) {
    if (from === to) return amount;
    if (!rates) return null;

    const toARS =
        from === Currency.ARS ? amount : rates[from] != null ? amount * rates[from] : null;

    if (toARS === null) return null;

    if (to === Currency.ARS) return toARS;

    return rates[to] != null ? toARS / rates[to] : null;
}
