import { formatMoney } from './FormatMoney';
import { t } from '@/i18n';

function frequencyLabel(fixed, quotas) {
    if (fixed) return t('common.fixed');
    return Number(quotas) > 1
        ? t('sharedEdit.installments', { count: Number(quotas) })
        : t('sharedEdit.singlePayment');
}

function typeLabel(type) {
    return type === 'INGRESO' ? t('common.income') : t('common.expense');
}

export function sharedEditChanges(gasto, payload) {
    const changes = {};
    if (Number(payload.amount) !== Number(gasto.amount)) changes.amount = Number(payload.amount);
    if (payload.currency_type !== gasto.currency_type)
        changes.currency_type = payload.currency_type;
    if (payload.type !== gasto.type) changes.type = payload.type;
    if (Boolean(payload.fixed_expense) !== Boolean(gasto.fixed_expense)) {
        changes.fixed_expense = Boolean(payload.fixed_expense);
    }
    if (
        !payload.fixed_expense &&
        Number(payload.number_of_quotas) !== Number(gasto.number_of_quotas)
    ) {
        changes.number_of_quotas = Number(payload.number_of_quotas);
    }
    return Object.keys(changes).length ? changes : null;
}

export function describeSharedEdit(changes, gasto) {
    const lines = [];
    if (changes.amount !== undefined) {
        lines.push(
            `${t('sharedEdit.amount')}: ${formatMoney(gasto.amount, gasto.currency_type)} → ${formatMoney(
                changes.amount,
                changes.currency_type ?? gasto.currency_type,
            )}`,
        );
    }
    if (changes.currency_type)
        lines.push(
            `${t('sharedEdit.currency')}: ${gasto.currency_type} → ${changes.currency_type}`,
        );
    if (changes.type)
        lines.push(
            `${t('sharedEdit.type')}: ${typeLabel(gasto.type)} → ${typeLabel(changes.type)}`,
        );
    if (changes.fixed_expense !== undefined || changes.number_of_quotas !== undefined) {
        const fixed = changes.fixed_expense ?? gasto.fixed_expense;
        const quotas = changes.number_of_quotas ?? gasto.number_of_quotas;
        lines.push(
            `${t('sharedEdit.frequency')}: ${frequencyLabel(gasto.fixed_expense, gasto.number_of_quotas)} → ${frequencyLabel(fixed, quotas)}`,
        );
    }
    return lines;
}
