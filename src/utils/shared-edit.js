import { formatMoney } from './FormatMoney';

function frequencyLabel(fixed, quotas) {
    if (fixed) return 'Fijo';
    return Number(quotas) > 1 ? `En cuotas (${quotas})` : 'Pago único';
}

function typeLabel(type) {
    return type === 'INGRESO' ? 'Ingreso' : 'Egreso';
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
            `Monto: ${formatMoney(gasto.amount, gasto.currency_type)} → ${formatMoney(
                changes.amount,
                changes.currency_type ?? gasto.currency_type,
            )}`,
        );
    }
    if (changes.currency_type)
        lines.push(`Moneda: ${gasto.currency_type} → ${changes.currency_type}`);
    if (changes.type) lines.push(`Tipo: ${typeLabel(gasto.type)} → ${typeLabel(changes.type)}`);
    if (changes.fixed_expense !== undefined || changes.number_of_quotas !== undefined) {
        const fixed = changes.fixed_expense ?? gasto.fixed_expense;
        const quotas = changes.number_of_quotas ?? gasto.number_of_quotas;
        lines.push(
            `Frecuencia: ${frequencyLabel(gasto.fixed_expense, gasto.number_of_quotas)} → ${frequencyLabel(fixed, quotas)}`,
        );
    }
    return lines;
}
