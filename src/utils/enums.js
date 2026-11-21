import { t } from '@/i18n';

export const Currency = Object.freeze({
    ARS: 'ARS',
    USD: 'USD',
    EUR: 'EUR',
    BRL: 'BRL',
    CLP: 'CLP',
    UYU: 'UYU',
});

export const CURRENCY_LABELS = Object.freeze({
    [Currency.ARS]: t('common.arsArgentinePesos'),
    [Currency.USD]: t('common.usdUsDollars'),
    [Currency.EUR]: t('common.eurEuros'),
    [Currency.BRL]: t('common.brlBrazilianReais'),
    [Currency.CLP]: t('common.clpChileanPesos'),
    [Currency.UYU]: t('common.uyuUruguayanPesos'),
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
    [ThemeMode.SYSTEM]: t('common.system'),
    [ThemeMode.LIGHT]: t('common.light'),
    [ThemeMode.DARK]: t('common.dark'),
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
    PAYMENT_REQUESTED: 'PAYMENT_REQUESTED',
    PAYMENT_REVERTED: 'PAYMENT_REVERTED',
    REVERSAL_REQUESTED: 'REVERSAL_REQUESTED',
    REVERSAL_CANCELLED: 'REVERSAL_CANCELLED',
    REVERSAL_REJECTED: 'REVERSAL_REJECTED',
    SHARED_APPROVED: 'SHARED_APPROVED',
    SHARED_REJECTED: 'SHARED_REJECTED',
    SHARED_RETRIED: 'SHARED_RETRIED',
    EDIT_REQUESTED: 'EDIT_REQUESTED',
    EDIT_APPROVED: 'EDIT_APPROVED',
    EDIT_REJECTED: 'EDIT_REJECTED',
    EDIT_CANCELLED: 'EDIT_CANCELLED',
});
