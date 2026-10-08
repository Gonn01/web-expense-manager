export const Currency = Object.freeze({
    ARS: 'ARS',
    USD: 'USD',
    EUR: 'EUR',
    BRL: 'BRL',
    CLP: 'CLP',
    UYU: 'UYU',
});

export const CURRENCY_LABELS = Object.freeze({
    [Currency.ARS]: 'ARS (Pesos Argentinos)',
    [Currency.USD]: 'USD (Dólares)',
    [Currency.EUR]: 'EUR (Euros)',
    [Currency.BRL]: 'BRL (Reales Brasileños)',
    [Currency.CLP]: 'CLP (Pesos Chilenos)',
    [Currency.UYU]: 'UYU (Pesos Uruguayos)',
});

export const ExpenseType = Object.freeze({
    EGRESO: 'EGRESO',
    INGRESO: 'INGRESO',
});
