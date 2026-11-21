import { getIntlLocale } from '@/i18n';

export function formatAmount(n) {
    return Number(n ?? 0).toFixed(2);
}

const VALID_CURRENCY = /^[A-Za-z]{3}$/;

export function formatMoney(amount, currency) {
    const value = Number(amount ?? 0);
    const sign = value < 0 ? '-' : '';
    const abs = Math.abs(value);

    if (VALID_CURRENCY.test(currency ?? '')) {
        try {
            const f = new Intl.NumberFormat(getIntlLocale(), {
                style: 'currency',
                currency,
                minimumFractionDigits: 2,
            });
            return `${sign}${f.format(abs)}`;
        } catch {}
    }

    const f = new Intl.NumberFormat(getIntlLocale(), { minimumFractionDigits: 2 });
    return `${sign}${f.format(abs)}`;
}
