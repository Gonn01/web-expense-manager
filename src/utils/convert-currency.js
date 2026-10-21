export function convertCurrency(amount, from, to, rates) {
    if (from === to) return amount;
    if (!rates) return null;

    const toARS = from === 'ARS' ? amount : rates[from] != null ? amount * rates[from] : null;

    if (toARS === null) return null;

    if (to === 'ARS') return toARS;

    return rates[to] != null ? toARS / rates[to] : null;
}
