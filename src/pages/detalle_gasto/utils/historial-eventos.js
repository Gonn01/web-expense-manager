export const TONES = {
    success: {
        border: 'border-l-emerald-500',
        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    },
    warning: {
        border: 'border-l-amber-500',
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    },
    danger: {
        border: 'border-l-red-500',
        badge: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
    },
    revert: {
        border: 'border-l-orange-500',
        badge: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400',
    },
    info: {
        border: 'border-l-sky-500',
        badge: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400',
    },
    postpone: {
        border: 'border-l-violet-500',
        badge: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',
    },
    neutral: {
        border: 'border-l-slate-400 dark:border-l-slate-500',
        badge: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300',
    },
};

const EVENTS = {
    CREATION: { icon: 'add_circle', tone: 'info', label: 'Creación' },
    PAYMENT: { icon: 'check_circle', tone: 'success', label: 'Pago' },
    PENDING_PAYMENT: { icon: 'hourglass_top', tone: 'warning', label: 'Pendiente' },
    PAYMENT_REJECTED: { icon: 'cancel', tone: 'danger', label: 'Rechazado' },
    PAYMENT_WITHDRAWN: { icon: 'remove_circle', tone: 'neutral', label: 'Retirado' },
    REFUND: { icon: 'undo', tone: 'revert', label: 'Reversión' },
    EDITED: { icon: 'edit', tone: 'info', label: 'Edición' },
    POSTPONED: { icon: 'schedule', tone: 'postpone', label: 'Postergado' },
    UNPOSTPONED: { icon: 'event_available', tone: 'postpone', label: 'Reactivado' },
    DELETE: { icon: 'delete', tone: 'danger', label: 'Eliminado' },
    RESTORE: { icon: 'restore', tone: 'success', label: 'Restaurado' },
};

const PAYMENT_TYPES = new Set([
    'PAYMENT',
    'PENDING_PAYMENT',
    'PAYMENT_REJECTED',
    'PAYMENT_WITHDRAWN',
    'REFUND',
]);

export function eventConfig(movement, gasto) {
    const config = EVENTS[movement.movement_type] ?? {
        icon: 'event',
        tone: 'neutral',
        label: movement.movement_type,
    };
    if (movement.movement_type === 'PAYMENT' && gasto.type === 'INGRESO') {
        return { ...config, label: 'Cobro' };
    }
    return config;
}

export function isPaymentEvent(movement) {
    return PAYMENT_TYPES.has(movement.movement_type);
}

function byPaymentDate(a, b) {
    const byDate = new Date(a.payment_date ?? 0) - new Date(b.payment_date ?? 0);
    if (byDate !== 0) return byDate;
    return new Date(a.created_at ?? 0) - new Date(b.created_at ?? 0);
}

export function paymentNumbers(movements) {
    const numbers = new Map();
    const pagos = movements.filter((m) => m.movement_type === 'PAYMENT').sort(byPaymentDate);
    const pendientes = movements
        .filter((m) => m.movement_type === 'PENDING_PAYMENT')
        .sort(byPaymentDate);
    pagos.forEach((m, i) => numbers.set(m.id, i + 1));
    pendientes.forEach((m, i) => numbers.set(m.id, pagos.length + i + 1));
    return numbers;
}

export function paymentLabel(gasto, number) {
    if (number == null) return null;
    if (gasto.fixed_expense) return `Pago #${number}`;
    return `Cuota ${number} de ${gasto.number_of_quotas}`;
}

export function eventTitle(movement, gasto, { number, counterpartyName }) {
    const otra = counterpartyName ?? 'la otra persona';
    const cobro = gasto.type === 'INGRESO';
    const cuota = paymentLabel(gasto, number);

    switch (movement.movement_type) {
        case 'CREATION':
            return 'Gasto creado';
        case 'PAYMENT':
            return cuota ?? (cobro ? 'Cuota cobrada' : 'Cuota pagada');
        case 'PENDING_PAYMENT':
            return `${cuota ?? 'Pago'} · esperando que ${otra} confirme`;
        case 'PAYMENT_REJECTED':
            return `Pago rechazado por ${otra}`;
        case 'PAYMENT_WITHDRAWN':
            return 'Pago retirado antes de que lo confirmaran';
        case 'REFUND': {
            const base = cobro ? 'Cobro revertido' : 'Pago revertido';
            return movement.detail?.trim() ? `${base}: ${movement.detail}` : base;
        }
        case 'EDITED':
            return movement.detail?.trim() ? movement.detail : 'Gasto editado';
        case 'POSTPONED':
            return 'Gasto postergado';
        case 'UNPOSTPONED':
            return movement.detail?.trim() ? movement.detail : 'Postergación quitada';
        case 'DELETE':
            return 'Gasto eliminado';
        case 'RESTORE':
            return 'Gasto restaurado';
        default:
            return movement.detail?.trim() ? movement.detail : movement.movement_type;
    }
}

export function isFinalizationPayment(movement, gasto) {
    return Boolean(
        movement.movement_type === 'PAYMENT' &&
            gasto.finalization_date &&
            movement.payment_date &&
            new Date(movement.payment_date).getTime() ===
                new Date(gasto.finalization_date).getTime(),
    );
}

export function formatEventDate(date) {
    if (!date) return null;
    return new Date(date).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function revertDialog({ movement, gasto, number, counterpartyName, settlementActive }) {
    const otra = counterpartyName ?? 'la otra persona';
    const cual = paymentLabel(gasto, number)?.toLowerCase() ?? 'este pago';

    if (movement.movement_type === 'PENDING_PAYMENT') {
        return {
            title: '¿Retirar el pago?',
            message: `Se retira el pago de ${cual} que le mandaste a ${otra}. La cuota vuelve a quedar sin pagar.`,
            confirmLabel: 'Retirar',
        };
    }
    if (gasto.shared_counterparty) {
        return {
            title: '¿Pedir la reversión?',
            message: `Se le va a pedir a ${otra} que confirme la reversión del pago de ${cual}. Cuando la acepte, el pago se elimina en los dos gastos.`,
            confirmLabel: 'Pedir reversión',
        };
    }
    return {
        title: '¿Revertir pago?',
        message:
            `Se eliminará el pago de ${cual} y se registrará un reembolso. Esta acción no se puede deshacer.` +
            (settlementActive
                ? ''
                : ' No hay una sesión de «Hacer cuentas» abierta: el reembolso queda en el historial del gasto, pero no en el historial de cuentas.'),
        confirmLabel: 'Revertir',
    };
}
