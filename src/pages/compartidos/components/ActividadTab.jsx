import { useState } from 'react';
import Icon from '@/components/Icon';
import Loader from '@/components/Loader';
import { desvincularUsuarioEntidad } from '@/services/api';
import useAuth from '@/store/use-auth-store';
import { useDialogStore } from '@/store/use-dialog-store';
import { useEntitiesStore } from '@/store/use-entities-store';
import { useNotificacionesStore } from '@/store/use-notificaciones-store';
import { useSnackbarStore } from '@/store/use-snackbar-store';
import { buildNotification, linkedEntityToUnlink } from '@/utils/notifications';
import { getIntlLocale, t } from '@/i18n';

const TONE_CLASSES = {
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    error: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
};
const DEFAULT_TONE = 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300';

const formatDate = (value) =>
    new Date(value).toLocaleString(getIntlLocale(), { dateStyle: 'short', timeStyle: 'short' });

export default function ActividadTab() {
    const { token } = useAuth();
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
        try {
            await markRead(id, token);
        } catch (err) {
            console.error('Error marcando notificación', err);
        }
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
            <div className="flex flex-col items-center text-center gap-3 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 px-6 py-10">
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
        <div className="flex flex-col gap-3 max-w-3xl">
            {unreadCount > 0 && (
                <button
                    type="button"
                    onClick={handleMarkAll}
                    disabled={markingAll}
                    className="cursor-pointer self-end text-sm font-semibold text-primary hover:underline disabled:opacity-50"
                >
                    {t('notifications.markAllRead')}
                </button>
            )}

            <ul className="flex flex-col gap-2">
                {items.map((item) => {
                    const notification = buildNotification(item.event, item.data);
                    if (!notification) return null;
                    const unread = !item.read_at;
                    const entityToUnlink = linkedEntityToUnlink(item, entities);

                    return (
                        <li
                            key={item.id}
                            className={`flex items-start gap-3 rounded-xl border p-3 ${
                                unread
                                    ? 'border-primary/40 bg-primary/5 dark:bg-primary/10'
                                    : 'border-zinc-200 bg-white/60 dark:border-[#29382f] dark:bg-white/[0.02]'
                            }`}
                        >
                            <span
                                className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                                    TONE_CLASSES[notification.tone] ?? DEFAULT_TONE
                                }`}
                            >
                                <Icon name={notification.icon} className="text-lg" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p
                                    className={`text-sm break-words text-zinc-800 dark:text-zinc-100 ${
                                        unread ? 'font-semibold' : ''
                                    }`}
                                >
                                    {notification.message}
                                </p>
                                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                                    {formatDate(item.created_at)}
                                </p>
                                {entityToUnlink && (
                                    <button
                                        type="button"
                                        onClick={() => handleUnlink(item, entityToUnlink)}
                                        className="cursor-pointer mt-2 inline-flex min-h-9 items-center gap-1 rounded-lg border border-zinc-300 px-3 text-xs font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-white/5"
                                    >
                                        <Icon name="link_off" className="text-base" />
                                        {t('notifications.unlinkToo')}
                                    </button>
                                )}
                            </div>
                            {unread && (
                                <button
                                    type="button"
                                    onClick={() => handleMarkRead(item.id)}
                                    aria-label={t('notifications.markRead')}
                                    title={t('notifications.markRead')}
                                    className="cursor-pointer flex size-9 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:bg-black/5 hover:text-primary dark:text-zinc-400 dark:hover:bg-white/10"
                                >
                                    <Icon name="done" className="text-xl" />
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
                    className="cursor-pointer self-center h-10 px-4 rounded-lg border border-zinc-300 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-white/5"
                >
                    {t('notifications.loadMore')}
                </button>
            )}
        </div>
    );
}
