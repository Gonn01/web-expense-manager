import { inDateRange } from '@/utils/date-range';
import { movementStyle } from '@/utils/movement-styles';

const LABELS = {
    CREATION: 'Creación',
    PAYMENT: 'Pago',
    PENDING_PAYMENT: 'Pendiente',
    PAYMENT_REJECTED: 'Rechazado',
    PAYMENT_WITHDRAWN: 'Retirado',
    REFUND: 'Reversión',
    EDITED: 'Edición',
    POSTPONED: 'Postergado',
    UNPOSTPONED: 'Reactivado',
    DELETE: 'Eliminado',
    RESTORE: 'Restaurado',
    PAYMENT_REQUESTED: 'Enviado',
    PAYMENT_REVERTED: 'Pago anulado',
    REVERSAL_REQUESTED: 'Reversión pedida',
    REVERSAL_CANCELLED: 'Reversión cancelada',
    REVERSAL_REJECTED: 'Reversión rechazada',
    SHARED_APPROVED: 'Aprobado',
    SHARED_REJECTED: 'Rechazado',
    SHARED_RETRIED: 'Reenviado',
};

const PAYMENT_TYPES = new Set([
    'PAYMENT',
    'PENDING_PAYMENT',
    'PAYMENT_REQUESTED',
    'PAYMENT_REJECTED',
    'PAYMENT_WITHDRAWN',
    'PAYMENT_REVERTED',
    'REFUND',
]);

const PAYMENT_LINKED_EVENTS = new Set([
    'PAYMENT_REQUESTED',
    'REVERSAL_REQUESTED',
    'REVERSAL_CANCELLED',
    'REVERSAL_REJECTED',
]);

function isDatedByResolution(movement) {
    const type = movement.movement_type;
    if (type === 'PAYMENT_REJECTED' || type === 'PAYMENT_WITHDRAWN') return true;
    return (
        (type === 'PAYMENT' || type === 'PAYMENT_REVERTED') && movement.created_by_user_id != null
    );
}

export function eventConfig(movement, gasto) {
    const type = movement.movement_type;
    const label = type === 'PAYMENT' && gasto.type === 'INGRESO' ? 'Cobro' : (LABELS[type] ?? type);
    return { ...movementStyle(type), label };
}

export function isPaymentEvent(movement) {
    return PAYMENT_TYPES.has(movement.movement_type);
}

export function eventDate(movement) {
    if (!isPaymentEvent(movement) || isDatedByResolution(movement)) return movement.created_at;
    return movement.payment_date ?? movement.created_at;
}

export function filterEventsByDate(movements, { from = '', to = '' } = {}) {
    if (!from && !to) return movements;
    return movements.filter((movement) => inDateRange(eventDate(movement), from, to));
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
    movements
        .filter((m) => PAYMENT_LINKED_EVENTS.has(m.movement_type))
        .forEach((m) => {
            const number = numbers.get(m.paired_movement_id);
            if (number != null) numbers.set(m.id, number);
        });
    return numbers;
}

export function paymentLabel(gasto, number) {
    if (number == null) return null;
    if (gasto.fixed_expense) return `Pago #${number}`;
    return `Cuota ${number} de ${gasto.number_of_quotas}`;
}

export function eventTitle(movement, gasto, { number, counterpartyName, currentUserId }) {
    const otra = counterpartyName ?? 'la otra persona';
    const cobro = gasto.type === 'INGRESO';
    const cuota = paymentLabel(gasto, number);
    const actor =
        currentUserId != null && String(movement.created_by_user_id) === String(currentUserId)
            ? 'vos'
            : otra;

    switch (movement.movement_type) {
        case 'CREATION':
            return 'Gasto creado';
        case 'PAYMENT':
            return cuota ?? (cobro ? 'Cuota cobrada' : 'Cuota pagada');
        case 'PENDING_PAYMENT':
            return `${cuota ?? 'Pago'} · esperando que ${otra} confirme`;
        case 'PAYMENT_REQUESTED':
            return `${cuota ?? 'Pago'} · enviado por ${actor}`;
        case 'PAYMENT_REVERTED':
            return 'Pago registrado, luego revertido';
        case 'REVERSAL_REQUESTED':
            return `${cuota ?? 'Pago'} · reversión pedida por ${actor}`;
        case 'REVERSAL_CANCELLED':
            return `${cuota ?? 'Pago'} · reversión cancelada por ${actor}`;
        case 'REVERSAL_REJECTED':
            return `${cuota ?? 'Pago'} · reversión rechazada por ${actor}`;
        case 'SHARED_APPROVED':
            return `Gasto compartido aprobado por ${actor}`;
        case 'SHARED_REJECTED':
            return `Gasto compartido rechazado por ${actor}`;
        case 'SHARED_RETRIED':
            return `Gasto compartido reenviado por ${actor}`;
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
        new Date(movement.payment_date).getTime() === new Date(gasto.finalization_date).getTime(),
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
