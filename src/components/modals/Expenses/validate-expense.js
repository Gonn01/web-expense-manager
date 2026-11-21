import { t } from '@/i18n';

export const MAX_INSTALLMENTS = 360;

export const EXPENSE_FIELD_LABELS = {
    entity: t('modals.financialEntity'),
    paymentEntity: t('modals.paymentEntity'),
    name: t('form.name'),
    amount: t('modals.amount'),
    installments: t('modals.numberOfInstallments'),
};

export function exceedsMaxInstallments(installments) {
    return Number(installments) > MAX_INSTALLMENTS;
}

export function validateExpenseForm({
    entity,
    name,
    amount,
    isInstallment = false,
    installments = '',
    payWithEntity = false,
    paymentEntity = '',
}) {
    const errors = {};

    if (!entity) {
        errors.entity = t('modals.chooseTheFinancialEntity');
    }

    if (payWithEntity) {
        if (!paymentEntity) {
            errors.paymentEntity = t('modals.chooseTheEntityUsedToPay');
        } else if (String(paymentEntity) === String(entity)) {
            errors.paymentEntity = t('modals.thePaymentEntityMustBeDifferentFrom');
        }
    }

    if (!name?.trim()) {
        errors.name = t('modals.theNameIsRequired');
    }

    if (String(amount ?? '').trim() === '') {
        errors.amount = t('modals.theAmountIsRequired');
    } else if (!(Number(amount) > 0)) {
        errors.amount = t('modals.theAmountMustBeGreaterThan02');
    }

    if (isInstallment) {
        const n = Number(installments);
        if (String(installments ?? '').trim() === '') {
            errors.installments = t('modals.theNumberOfInstallmentsIsRequired');
        } else if (!Number.isInteger(n) || n < 1) {
            errors.installments = t('modals.theNumberOfInstallmentsMustBeA');
        } else if (exceedsMaxInstallments(n)) {
            errors.installments = t('form.maxInstallments', { max: MAX_INSTALLMENTS });
        }
    }

    return errors;
}

export function focusFirstError(container, errors) {
    const first = Object.keys(errors)[0];
    if (!container || !first) return;

    const field = container.querySelector(`[data-field="${first}"]`);
    if (!field) return;

    field.scrollIntoView({ behavior: 'smooth', block: 'center' });
    field.querySelector('input, select')?.focus({ preventScroll: true });
}
