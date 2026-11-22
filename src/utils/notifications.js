import { t } from '@/i18n';

const quoted = (name) => (name ? `"${name}"` : t('realtime.anExpense'));

const BUILDERS = {
    'compartido.nuevo': ({ actorName, who, gastoName }) => ({
        message: actorName
            ? t('realtime.newSharedFrom', { who, expense: quoted(gastoName) })
            : t('common.youReceivedANewSharedExpense'),
        icon: 'call_received',
    }),
    'compartido.aprobado': ({ receiver, gastoName }) => ({
        message: t('realtime.expenseAccepted', {
            who: receiver,
            expense: gastoName ? ` "${gastoName}"` : '',
        }),
        icon: 'check_circle',
        tone: 'success',
    }),
    'compartido.rechazado': ({ receiver, gastoName }) => ({
        message: t('realtime.expenseRejected', {
            who: receiver,
            expense: gastoName ? ` "${gastoName}"` : '',
        }),
        icon: 'cancel',
        tone: 'error',
    }),
    'compartido.descartado': ({ who }) => ({
        message: t('realtime.expenseDiscarded', { who }),
        icon: 'delete',
    }),
    'compartido.desvinculado': ({ who, gastoName, confirmedPayments }) => ({
        message: `${t('realtime.expenseUnshared', { who, expense: quoted(gastoName) })}${
            confirmedPayments > 0 ? t('realtime.expenseUnsharedConfirmed') : ''
        }`,
        icon: 'link_off',
    }),
    'pago.pendiente': ({ actorName, who }) => ({
        message: actorName
            ? t('realtime.paymentPending', { who })
            : t('common.youHaveAPaymentToConfirmIn'),
        icon: 'pending_actions',
        tone: 'success',
    }),
    'pago.confirmado': ({ who }) => ({
        message: t('realtime.paymentConfirmed', { who }),
        icon: 'task_alt',
        tone: 'success',
    }),
    'pago.rechazado': ({ who }) => ({
        message: t('realtime.paymentRejected', { who }),
        icon: 'cancel',
        tone: 'error',
    }),
    'pago.retirado': ({ who }) => ({
        message: t('realtime.paymentWithdrawn', { who }),
        icon: 'undo',
    }),
    'pago.reversion_solicitada': ({ who }) => ({
        message: t('realtime.reversalRequested', { who }),
        icon: 'undo',
        tone: 'success',
    }),
    'pago.reversion_cancelada': ({ who }) => ({
        message: t('realtime.reversalCancelled', { who }),
        icon: 'undo',
    }),
    'pago.reversion_aceptada': ({ who }) => ({
        message: t('realtime.reversalAccepted', { who }),
        icon: 'task_alt',
        tone: 'success',
    }),
    'pago.reversion_rechazada': ({ who }) => ({
        message: t('realtime.reversalRejected', { who }),
        icon: 'cancel',
        tone: 'error',
    }),
    'edicion.solicitada': ({ who, gastoName }) => ({
        message: t('realtime.editRequested', { who, expense: ` ${quoted(gastoName)}` }),
        icon: 'edit',
        tone: 'success',
    }),
    'edicion.cancelada': ({ who }) => ({
        message: t('realtime.editCancelled', { who }),
        icon: 'edit_off',
    }),
    'edicion.aprobada': ({ who, gastoName }) => ({
        message: t('realtime.editApproved', {
            who,
            expense: gastoName ? t('realtime.ofExpense', { expense: gastoName }) : '',
        }),
        icon: 'task_alt',
        tone: 'success',
    }),
    'edicion.rechazada': ({ who, gastoName }) => ({
        message: t('realtime.editRejected', {
            who,
            expense: gastoName ? t('realtime.ofExpense', { expense: gastoName }) : '',
        }),
        icon: 'cancel',
        tone: 'error',
    }),
    'entidad.vinculada': ({ who }) => ({
        message: t('realtime.entityLinked', { who }),
        icon: 'link',
    }),
    'entidad.desvinculada': ({ who }) => ({
        message: t('realtime.entityUnlinked', { who }),
        icon: 'link_off',
    }),
    'gasto.postergado': ({ who, gastoName }) => ({
        message: t('realtime.expensePostponed', { who, expense: quoted(gastoName) }),
        icon: 'schedule',
    }),
    'gasto.postergacion_quitada': ({ who, gastoName }) => ({
        message: t('realtime.expenseUnpostponed', { who, expense: quoted(gastoName) }),
        icon: 'update',
    }),
};

export function buildNotification(event, data = {}) {
    const build = BUILDERS[event];
    if (!build) return null;
    return {
        tone: undefined,
        ...build({
            ...data,
            who: data.actorName || t('common.theOtherPerson'),
            receiver: data.receiverName || t('common.aUser'),
        }),
    };
}

const ACTION_EVENTS = new Set([
    'compartido.nuevo',
    'compartido.rechazado',
    'pago.pendiente',
    'pago.reversion_solicitada',
    'edicion.solicitada',
]);

export function notificationTarget(notification, entities) {
    const { event, data = {} } = notification;
    if (ACTION_EVENTS.has(event)) return '/app/compartidos';
    if (data.ownGastoId != null) return `/app/gastos/${data.ownGastoId}`;
    if (!event.startsWith('entidad.') || data.entityId == null) return null;
    const exists = entities.some((entity) => String(entity.id) === String(data.entityId));
    return exists ? `/app/entidades/${data.entityId}` : null;
}

export function linkedEntityToUnlink(notification, entities) {
    if (notification.event !== 'entidad.desvinculada') return null;
    const { entityId, actorId } = notification.data ?? {};
    if (entityId == null || actorId == null) return null;
    return (
        entities.find(
            (entity) =>
                String(entity.id) === String(entityId) &&
                String(entity.linked_user_id) === String(actorId),
        ) ?? null
    );
}

export function mergeFirstPage(currentItems, currentNextBefore, page) {
    const lastOfPage = page.items.at(-1);
    if (!currentItems.length || !lastOfPage || page.next_before == null) {
        return { items: page.items, nextBefore: page.next_before };
    }
    const oldestInPage = Number(lastOfPage.id);
    const overlaps = currentItems.some((item) => Number(item.id) >= oldestInPage);
    if (!overlaps) return { items: page.items, nextBefore: page.next_before };
    return {
        items: [...page.items, ...currentItems.filter((item) => Number(item.id) < oldestInPage)],
        nextBefore: currentNextBefore,
    };
}
