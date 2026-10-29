export const MAX_INSTALLMENTS = 360;

export const EXPENSE_FIELD_LABELS = {
    entity: 'Entidad financiera',
    paymentEntity: 'Entidad de pago',
    name: 'Nombre',
    amount: 'Monto',
    installments: 'Cantidad de cuotas',
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
        errors.entity = 'Elegí la entidad financiera.';
    }

    if (payWithEntity) {
        if (!paymentEntity) {
            errors.paymentEntity = 'Elegí la entidad con la que se paga.';
        } else if (String(paymentEntity) === String(entity)) {
            errors.paymentEntity = 'La entidad de pago tiene que ser distinta de la del gasto.';
        }
    }

    if (!name?.trim()) {
        errors.name = 'El nombre es obligatorio.';
    }

    if (String(amount ?? '').trim() === '') {
        errors.amount = 'El monto es obligatorio.';
    } else if (!(Number(amount) > 0)) {
        errors.amount = 'El monto debe ser mayor a 0.';
    }

    if (isInstallment) {
        const n = Number(installments);
        if (String(installments ?? '').trim() === '') {
            errors.installments = 'La cantidad de cuotas es obligatoria.';
        } else if (!Number.isInteger(n) || n < 1) {
            errors.installments = 'La cantidad de cuotas debe ser un número entero mayor a 0.';
        } else if (exceedsMaxInstallments(n)) {
            errors.installments = `El máximo es de ${MAX_INSTALLMENTS} cuotas.`;
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
