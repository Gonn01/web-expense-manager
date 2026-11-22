import { convertCurrency } from '@/utils/convert-currency';
import { formatAmount } from '@/utils/FormatMoney';
import { Currency } from '@/utils/enums';
import { t } from '@/i18n';

const RATE_NAMES = {
    [Currency.USD]: 'share.rateUsd',
    [Currency.EUR]: 'share.rateEur',
    [Currency.BRL]: 'share.rateBrl',
    [Currency.CLP]: 'share.rateClp',
    [Currency.UYU]: 'share.rateUyu',
};

function purchaseText(it, displayCur, rates) {
    const original = Number(it.amount_per_quota ?? 0);
    const originalPart = `${original.toFixed(1)} ${it.currency_type}`;
    let amount;
    if (!displayCur || it.currency_type === displayCur) {
        amount = originalPart;
    } else {
        const converted = convertCurrency(original, it.currency_type, displayCur, rates);
        amount = `${originalPart} (${(converted ?? 0).toFixed(1)} ${displayCur})`;
    }
    const cuota = it.fixed_expense
        ? it.type === 'INGRESO'
            ? t('common.fixedIncome')
            : t('common.fixedExpense')
        : t('share.installmentProgress', { number: it.payed_quotas, total: it.number_of_quotas });
    return `${it.name}: ${amount}\n${cuota}\n\n`;
}

export function buildWhatsAppText(group, selectedCurrency, preferredCurrency, rates) {
    const activeItems = group.items.filter((i) => !i.is_postponed);
    const buf = [];
    buf.push(`${group.name}: \n`);

    if (selectedCurrency) {
        const items = activeItems.filter((i) => i.currency_type === selectedCurrency);
        const egresos = items.filter((i) => i.type !== 'INGRESO');
        const ingresos = items.filter((i) => i.type === 'INGRESO');
        const totalDebtor = egresos.reduce((s, it) => s + Number(it.amount_per_quota ?? 0), 0);
        const totalCreditor = ingresos.reduce((s, it) => s + Number(it.amount_per_quota ?? 0), 0);

        if (egresos.length > 0) {
            buf.push(`\n${t('share.iOweYou', { currency: selectedCurrency })}\n\n`);
            for (const it of egresos) buf.push(purchaseText(it, selectedCurrency, null));
            buf.push(
                `${t('share.totalIOweYou')} ${formatAmount(totalDebtor)} ${selectedCurrency}\n\n\n`,
            );
        }
        if (ingresos.length > 0) {
            buf.push(`${t('share.youOweMe', { currency: selectedCurrency })}\n\n`);
            for (const it of ingresos) buf.push(purchaseText(it, selectedCurrency, null));
            buf.push(
                `${t('share.totalYouOweMe')} ${formatAmount(totalCreditor)} ${selectedCurrency}\n\n\n`,
            );
        }

        const balance = totalDebtor - totalCreditor;
        const label = balance < 0 ? t('share.summaryYouOweMe') : t('share.summaryIOweYou');
        buf.push(`${label} ${formatAmount(Math.abs(balance))} ${selectedCurrency}`);
        if (totalDebtor > 0 && totalCreditor > 0) {
            buf.push(
                ` (${formatAmount(Math.max(totalDebtor, totalCreditor))} - ${formatAmount(Math.min(totalDebtor, totalCreditor))})`,
            );
        }
        return buf.join('');
    }

    const cur = preferredCurrency ?? Currency.ARS;
    const egresos = activeItems.filter((i) => i.type !== 'INGRESO');
    const ingresos = activeItems.filter((i) => i.type === 'INGRESO');

    const totalDebtor = egresos.reduce(
        (s, it) =>
            s +
            (convertCurrency(Number(it.amount_per_quota ?? 0), it.currency_type, cur, rates) ?? 0),
        0,
    );
    const totalCreditor = ingresos.reduce(
        (s, it) =>
            s +
            (convertCurrency(Number(it.amount_per_quota ?? 0), it.currency_type, cur, rates) ?? 0),
        0,
    );

    if (egresos.length > 0) {
        buf.push(`\n${t('share.iOweYou', { currency: cur })}\n\n`);
        for (const it of egresos) buf.push(purchaseText(it, cur, rates));
        buf.push(`${t('share.totalIOweYou')} ${formatAmount(totalDebtor)} ${cur}\n\n\n`);
    }
    if (ingresos.length > 0) {
        buf.push(`${t('share.youOweMe', { currency: cur })}\n\n`);
        for (const it of ingresos) buf.push(purchaseText(it, cur, rates));
        buf.push(`${t('share.totalYouOweMe')} ${formatAmount(totalCreditor)} ${cur}\n\n\n`);
    }

    for (const code of Object.values(Currency)) {
        const used = activeItems.some((i) => i.currency_type === code);
        if (used && rates?.[code]) {
            const rate = rates[code];
            const line = RATE_NAMES[code]
                ? t('share.rateUsed', { name: t(RATE_NAMES[code]), code, rate })
                : t('share.rateUsedGeneric', { code, rate });
            buf.push(`${line}\n\n\n`);
        }
    }

    const balance = totalDebtor - totalCreditor;
    const label = balance < 0 ? t('share.summaryYouOweMe') : t('share.summaryIOweYou');
    buf.push(`${label} ${formatAmount(Math.abs(balance))} ${cur}`);
    if (totalDebtor > 0 && totalCreditor > 0) {
        buf.push(
            ` (${formatAmount(Math.max(totalDebtor, totalCreditor))} - ${formatAmount(Math.min(totalDebtor, totalCreditor))})`,
        );
    }

    return buf.join('');
}
