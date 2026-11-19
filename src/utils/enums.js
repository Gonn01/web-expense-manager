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

export const ExpenseStatus = Object.freeze({
    ACTIVE: 'ACTIVE',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    REJECTED: 'REJECTED',
});

export const ThemeMode = Object.freeze({
    SYSTEM: 'system',
    LIGHT: 'light',
    DARK: 'dark',
});

export const THEME_MODE_LABELS = Object.freeze({
    [ThemeMode.SYSTEM]: 'Sistema',
    [ThemeMode.LIGHT]: 'Claro',
    [ThemeMode.DARK]: 'Oscuro',
});

export const MovementType = Object.freeze({
    CREATION: 'CREATION',
    PAYMENT: 'PAYMENT',
    PENDING_PAYMENT: 'PENDING_PAYMENT',
    PAYMENT_REJECTED: 'PAYMENT_REJECTED',
    PAYMENT_WITHDRAWN: 'PAYMENT_WITHDRAWN',
    REFUND: 'REFUND',
    DELETE: 'DELETE',
    RESTORE: 'RESTORE',
    EDITED: 'EDITED',
    POSTPONED: 'POSTPONED',
    UNPOSTPONED: 'UNPOSTPONED',
    LINK: 'LINK',
    UNLINK: 'UNLINK',
    PURCHASE_CREATED: 'PURCHASE_CREATED',
});
