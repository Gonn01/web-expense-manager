import { MovementType } from '@/utils/enums';

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

const MOVEMENT_STYLES = {
    [MovementType.CREATION]: { icon: 'add_circle', tone: 'info' },
    [MovementType.PURCHASE_CREATED]: { icon: 'add_circle', tone: 'success' },
    [MovementType.PAYMENT]: { icon: 'check_circle', tone: 'success' },
    [MovementType.PENDING_PAYMENT]: { icon: 'hourglass_top', tone: 'warning' },
    [MovementType.PAYMENT_REJECTED]: { icon: 'cancel', tone: 'danger' },
    [MovementType.PAYMENT_WITHDRAWN]: { icon: 'remove_circle', tone: 'neutral' },
    [MovementType.REFUND]: { icon: 'undo', tone: 'revert' },
    [MovementType.EDITED]: { icon: 'edit', tone: 'info' },
    [MovementType.POSTPONED]: { icon: 'schedule', tone: 'postpone' },
    [MovementType.UNPOSTPONED]: { icon: 'event_available', tone: 'postpone' },
    [MovementType.DELETE]: { icon: 'delete', tone: 'danger' },
    [MovementType.RESTORE]: { icon: 'restore', tone: 'success' },
    [MovementType.LINK]: { icon: 'link', tone: 'info' },
    [MovementType.UNLINK]: { icon: 'link_off', tone: 'info' },
    [MovementType.PAYMENT_REQUESTED]: { icon: 'send', tone: 'info' },
    [MovementType.PAYMENT_RECEIVED]: { icon: 'call_received', tone: 'info' },
    [MovementType.PAYMENT_REVERTED]: { icon: 'history', tone: 'revert' },
    [MovementType.REVERSAL_REQUESTED]: { icon: 'pending_actions', tone: 'warning' },
    [MovementType.REVERSAL_CANCELLED]: { icon: 'remove_circle', tone: 'neutral' },
    [MovementType.REVERSAL_REJECTED]: { icon: 'cancel', tone: 'danger' },
    [MovementType.SHARED_SENT]: { icon: 'group_add', tone: 'info' },
    [MovementType.SHARED_APPROVED]: { icon: 'check_circle', tone: 'success' },
    [MovementType.SHARED_REJECTED]: { icon: 'cancel', tone: 'danger' },
    [MovementType.SHARED_RETRIED]: { icon: 'replay', tone: 'info' },
    [MovementType.EDIT_REQUESTED]: { icon: 'pending_actions', tone: 'warning' },
    [MovementType.EDIT_APPROVED]: { icon: 'check_circle', tone: 'success' },
    [MovementType.EDIT_REJECTED]: { icon: 'cancel', tone: 'danger' },
    [MovementType.EDIT_CANCELLED]: { icon: 'remove_circle', tone: 'neutral' },
};

const FALLBACK_STYLE = { icon: 'event', tone: 'neutral' };

export function movementStyle(movementType) {
    return MOVEMENT_STYLES[movementType] ?? FALLBACK_STYLE;
}
