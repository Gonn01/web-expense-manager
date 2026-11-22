import { inDateRange } from '@/utils/date-range';
import { movementStyle } from '@/utils/movement-styles';
import { getIntlLocale } from '@/i18n';
import { t } from '@/i18n';

const LABELS = {
    CREATION: t('detalleGasto.created'),
    PAYMENT: t('common.payment'),
    PENDING_PAYMENT: t('common.pending'),
    PAYMENT_REJECTED: t('common.rejected'),
    PAYMENT_WITHDRAWN: t('common.withdrawn'),
    REFUND: t('common.reversal'),
    EDITED: t('common.edit'),
    POSTPONED: t('detalleGasto.postponed'),
    UNPOSTPONED: t('detalleGasto.reactivated'),
    DELETE: t('detalleGasto.deleted'),
    RESTORE: t('detalleGasto.restored'),
    PAYMENT_REQUESTED: t('detalleGasto.sent'),
    PAYMENT_RECEIVED: t('detalleGasto.received'),
    PAYMENT_REVERTED: t('detalleGasto.paymentVoided'),
    REVERSAL_REQUESTED: t('detalleGasto.reversalRequested'),
    REVERSAL_CANCELLED: t('detalleGasto.reversalCancelled'),
    REVERSAL_REJECTED: t('common.reversalRejected'),
    SHARED_SENT: t('detalleGasto.sharedEvent'),
    SHARED_APPROVED: t('common.approved'),
    SHARED_REJECTED: t('common.rejected'),
    SHARED_RETRIED: t('detalleGasto.resent'),
    EDIT_REQUESTED: t('detalleGasto.editRequested'),
    EDIT_APPROVED: t('common.editApproved'),
    EDIT_REJECTED: t('common.editRejected'),
    EDIT_CANCELLED: t('detalleGasto.editCancelled'),
};

const EDIT_TITLES = {
    EDIT_REQUESTED: 'history.editRequestedBy',
    EDIT_APPROVED: 'history.editApprovedBy',
    EDIT_REJECTED: 'history.editRejectedBy',
    EDIT_CANCELLED: 'history.editCancelledBy',
};

const PAYMENT_TYPES = new Set([
    'PAYMENT',
    'PENDING_PAYMENT',
    'PAYMENT_REQUESTED',
    'PAYMENT_RECEIVED',
    'PAYMENT_REJECTED',
    'PAYMENT_WITHDRAWN',
    'PAYMENT_REVERTED',
    'REFUND',
]);

const PAYMENT_LINKED_EVENTS = new Set([
    'PAYMENT_REQUESTED',
    'PAYMENT_RECEIVED',
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
    const label =
        type === 'PAYMENT' && gasto.type === 'INGRESO'
            ? t('common.collection')
            : (LABELS[type] ?? type);
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

export function lastPayment(movements = []) {
    const pagos = movements.filter((m) => m.movement_type === 'PAYMENT').sort(byPaymentDate);
    return pagos.at(-1) ?? null;
}

export function paymentLabel(gasto, number) {
    if (number == null) return null;
    if (gasto.fixed_expense) return t('history.paymentNumber', { number });
    return t('history.installmentOf', { number, total: gasto.number_of_quotas });
}

export function eventTitle(movement, gasto, { number, counterpartyName, currentUserId }) {
    const otra = counterpartyName ?? t('people.otherPerson');
    const cobro = gasto.type === 'INGRESO';
    const cuota = paymentLabel(gasto, number);
    const actor =
        currentUserId != null && String(movement.created_by_user_id) === String(currentUserId)
            ? t('history.actorYou')
            : otra;

    switch (movement.movement_type) {
        case 'CREATION':
            return t('common.expenseCreated');
        case 'PAYMENT':
            return (
                cuota ??
                (cobro ? t('detalleGasto.installmentCollected') : t('detalleGasto.installmentPaid'))
            );
        case 'PENDING_PAYMENT':
            return t('history.waitingConfirm', {
                payment: cuota ?? t('common.payment'),
                name: otra,
            });
        case 'PAYMENT_REQUESTED':
            return t('history.sentBy', { payment: cuota ?? t('common.payment'), actor });
        case 'PAYMENT_RECEIVED':
            return cuota
                ? t('history.receivedFrom', { payment: cuota, name: otra })
                : t('history.paymentReceivedFrom', { name: otra });
        case 'PAYMENT_REVERTED':
            return t('detalleGasto.paymentRecordedLaterReverted');
        case 'REVERSAL_REQUESTED':
            return t('history.reversalRequestedBy', {
                payment: cuota ?? t('common.payment'),
                actor,
            });
        case 'REVERSAL_CANCELLED':
            return t('history.reversalCancelledBy', {
                payment: cuota ?? t('common.payment'),
                actor,
            });
        case 'REVERSAL_REJECTED':
            return t('history.reversalRejectedBy', {
                payment: cuota ?? t('common.payment'),
                actor,
            });
        case 'SHARED_SENT':
            return currentUserId != null &&
                String(movement.created_by_user_id) === String(currentUserId)
                ? t('history.sharedSentTo', { name: otra })
                : t('history.sharedReceivedFrom', { name: otra });
        case 'SHARED_APPROVED':
            return t('history.sharedApprovedBy', { actor });
        case 'SHARED_REJECTED':
            return t('history.sharedRejectedBy', { actor });
        case 'SHARED_RETRIED':
            return t('history.sharedResentBy', { actor });
        case 'EDIT_REQUESTED':
        case 'EDIT_APPROVED':
        case 'EDIT_REJECTED':
        case 'EDIT_CANCELLED': {
            const title = t(EDIT_TITLES[movement.movement_type], { actor });
            return movement.detail?.trim() ? `${title}\n${movement.detail}` : title;
        }
        case 'PAYMENT_REJECTED':
            return t('history.paymentRejectedBy', { name: otra });
        case 'PAYMENT_WITHDRAWN':
            return t('detalleGasto.paymentWithdrawnBeforeItWasConfirmed');
        case 'REFUND': {
            const base = cobro ? t('detalleGasto.collectionReverted') : t('common.paymentReverted');
            return movement.detail?.trim() ? `${base}: ${movement.detail}` : base;
        }
        case 'EDITED':
            return movement.detail?.trim() ? movement.detail : t('detalleGasto.expenseEdited');
        case 'POSTPONED':
            return t('detalleGasto.expensePostponed');
        case 'UNPOSTPONED':
            return movement.detail?.trim() ? movement.detail : t('common.postponementRemoved');
        case 'DELETE':
            return t('common.expenseDeleted');
        case 'RESTORE':
            return t('common.expenseRestored');
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
    return new Date(date).toLocaleString(getIntlLocale(), {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function revertDialog({ movement, gasto, number, counterpartyName, settlementActive }) {
    const otra = counterpartyName ?? t('people.otherPerson');
    const cual = paymentLabel(gasto, number)?.toLowerCase() ?? t('history.thisPayment');

    if (movement.movement_type === 'PENDING_PAYMENT') {
        return {
            title: t('common.withdrawThePayment'),
            message: t('history.withdrawMessage', { which: cual, name: otra }),
            confirmLabel: t('common.withdraw'),
        };
    }
    if (gasto.shared_counterparty) {
        return {
            title: t('detalleGasto.requestTheReversal'),
            message: t('history.requestReversalMessage', { which: cual, name: otra }),
            confirmLabel: t('detalleGasto.requestReversal'),
        };
    }
    return {
        title: t('detalleGasto.revertPayment'),
        message:
            t('history.revertMessage', { which: cual }) +
            (settlementActive ? '' : t('history.noSessionRefund')),
        confirmLabel: t('common.revert'),
    };
}
