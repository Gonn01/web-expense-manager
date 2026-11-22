import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/Icon';
import Loader from '@/components/Loader';
import { desvincularUsuarioEntidad } from '@/services/api';
import useAuth from '@/store/use-auth-store';
import { useDialogStore } from '@/store/use-dialog-store';
import { useEntitiesStore } from '@/store/use-entities-store';
import { useNotificacionesStore } from '@/store/use-notificaciones-store';
import { useSnackbarStore } from '@/store/use-snackbar-store';
import { buildNotification, linkedEntityToUnlink, notificationTarget } from '@/utils/notifications';
import { getIntlLocale, t } from '@/i18n';

const TONE_CLASSES = {
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    error: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
};
const DEFAULT_TONE = 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300';

const formatDate = (value) =>
    new Date(value).toLocaleString(getIntlLocale(), { dateStyle: 'short', timeStyle: 'short' });

export default function NotificationsList({ onNavigate }) {
    const { token } = useAuth();
    const navigate = useNavigate();
    const entities = useEntitiesStore((s) => s.entities);
    const {
        items,
        unreadCount,
        nextBefore,
        loading,
        loadingMore,
        loadMore,
        markRead,
        markAllRead,
    } = useNotificacionesStore();
    const [markingAll, setMarkingAll] = useState(false);
    const [markingIds, setMarkingIds] = useState(() => new Set());

    const handleMarkAll = async () => {
        setMarkingAll(true);
        try {
            await markAllRead(token);
        } catch (err) {
            console.error('Error marcando notificaciones', err);
        } finally {
            setMarkingAll(false);
        }
    };

    const handleMarkRead = async (id) => {
        setMarkingIds((prev) => new Set(prev).add(id));
        try {
            await markRead(id, token);
        } catch (err) {
            console.error('Error marcando notificación', err);
        } finally {
            setMarkingIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const handleOpen = (item, target) => {
        if (!item.read_at) handleMarkRead(item.id);
        if (!target) return;
        onNavigate?.();
        navigate(target);
    };

    const handleUnlink = (notification, entity) =>
        useDialogStore.getState().confirm({
            title: t('notifications.unlinkTooTitle'),
            message: t('notifications.unlinkTooMessage', {
                entity: entity.name,
                name: notification.data.actorName || t('common.theOtherPerson'),
            }),
            tone: 'danger',
            confirmLabel: t('notifications.unlinkToo'),
            onConfirm: async () => {
                await desvincularUsuarioEntidad(entity.id, token);
                useEntitiesStore.getState().updateEntity(entity.id, {
                    linked_user_id: null,
                    linked_user_name: null,
                    linked_user_email: null,
                });
                await handleMarkRead(notification.id);
                useSnackbarStore.getState().show(t('notifications.unlinked'), 'success');
            },
        });

    if (loading) return <Loader />;

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center text-center gap-3 px-4 py-10">
                <Icon name="notifications" className="text-4xl text-zinc-400 dark:text-zinc-500" />
                <p className="text-lg font-bold text-zinc-800 dark:text-white">
                    {t('notifications.emptyTitle')}
                </p>
                <p className="max-w-md text-sm text-zinc-500 dark:text-zinc-400">
                    {t('notifications.emptyHint')}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {unreadCount > 0 && (
                <button
                    type="button"
                    onClick={handleMarkAll}
                    disabled={markingAll}
                    aria-busy={markingAll}
                    className="relative cursor-pointer self-end text-sm font-semibold text-primary hover:underline disabled:cursor-wait"
                >
                    <span className={markingAll ? 'invisible' : ''}>
                        {t('notifications.markAllRead')}
                    </span>
                    {markingAll && (
                        <span className="absolute inset-0 flex items-center justify-center">
                            <span className="w-4 h-4 border-2 border-current/40 border-t-current rounded-full animate-spin" />
                        </span>
                    )}
                </button>
            )}

            <ul className="flex flex-col gap-2">
                {items.map((item) => {
                    const notification = buildNotification(item.event, item.data);
                    if (!notification) return null;
                    const unread = !item.read_at;
                    const entityToUnlink = linkedEntityToUnlink(item, entities);
                    const target = notificationTarget(item, entities);
                    const marking = markingIds.has(item.id);

                    return (
                        <li
                            key={item.id}
                            className={`rounded-xl border p-3 ${
                                unread
                                    ? 'border-primary/40 bg-primary/5 dark:bg-primary/10'
                                    : 'border-zinc-200 bg-white/60 dark:border-[#29382f] dark:bg-white/[0.02]'
                            }`}
                        >
                            <button
                                type="button"
                                onClick={() => handleOpen(item, target)}
                                disabled={!unread && !target}
                                className="flex w-full items-start gap-3 rounded-lg text-left enabled:cursor-pointer enabled:hover:opacity-80"
                            >
                                <span
                                    className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                                        TONE_CLASSES[notification.tone] ?? DEFAULT_TONE
                                    }`}
                                >
                                    <Icon
                                        name={marking ? 'progress_activity' : notification.icon}
                                        className={`text-lg ${marking ? 'animate-spin' : ''}`}
                                    />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span
                                        className={`block text-sm break-words text-zinc-800 dark:text-zinc-100 ${
                                            unread ? 'font-semibold' : ''
                                        }`}
                                    >
                                        {notification.message}
                                    </span>
                                    <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                                        {formatDate(item.created_at)}
                                    </span>
                                </span>
                                {target && (
                                    <Icon
                                        name="chevron_right"
                                        className="shrink-0 self-center text-xl text-zinc-400 dark:text-zinc-500"
                                    />
                                )}
                            </button>
                            {entityToUnlink && (
                                <button
                                    type="button"
                                    onClick={() => handleUnlink(item, entityToUnlink)}
                                    className="cursor-pointer mt-2 ml-12 inline-flex min-h-9 items-center gap-1 rounded-lg border border-zinc-300 px-3 text-xs font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-white/5"
                                >
                                    <Icon name="link_off" className="text-base" />
                                    {t('notifications.unlinkToo')}
                                </button>
                            )}
                        </li>
                    );
                })}
            </ul>

            {nextBefore && (
                <button
                    type="button"
                    onClick={() => loadMore(token)}
                    disabled={loadingMore}
                    aria-busy={loadingMore}
                    className="relative cursor-pointer self-center h-10 px-4 rounded-lg border border-zinc-300 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 disabled:cursor-wait dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-white/5"
                >
                    <span className={loadingMore ? 'invisible' : ''}>
                        {t('notifications.loadMore')}
                    </span>
                    {loadingMore && (
                        <span className="absolute inset-0 flex items-center justify-center">
                            <span className="w-4 h-4 border-2 border-current/40 border-t-current rounded-full animate-spin" />
                        </span>
                    )}
                </button>
            )}
        </div>
    );
}
