import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/Icon';
import NotificationsList from './NotificationsList';
import { useNotificacionesStore } from '@/store/use-notificaciones-store';
import { t } from '@/i18n';

const MAX_VISIBLE_COUNT = 99;

export default function NotificationsBell() {
    const unreadCount = useNotificacionesStore((s) => s.unreadCount);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) return;
        const onKey = (event) => event.key === 'Escape' && setOpen(false);
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-label={t('notifications.open')}
                title={t('notifications.title')}
                className="relative flex size-10 shrink-0 items-center justify-center rounded-lg text-slate-700 hover:bg-black/5 dark:text-slate-200 dark:hover:bg-white/10 cursor-pointer"
            >
                <Icon name="notifications" className="text-2xl" />
                {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-emerald-700 px-1 text-[10px] font-bold text-white">
                        {unreadCount > MAX_VISIBLE_COUNT ? `${MAX_VISIBLE_COUNT}+` : unreadCount}
                    </span>
                )}
            </button>

            {open &&
                createPortal(
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setOpen(false)}
                            aria-hidden="true"
                        />
                        <section
                            role="dialog"
                            aria-label={t('notifications.title')}
                            className="font-display fixed inset-x-2 top-16 z-50 flex max-h-[calc(100dvh-5rem)] flex-col rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-[#29382f] dark:bg-background-dark lg:left-auto lg:right-5 lg:top-14 lg:w-[26rem]"
                        >
                            <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 py-2 pl-4 pr-2 dark:border-[#29382f]">
                                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                                    {t('notifications.title')}
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    aria-label={t('common.close')}
                                    title={t('common.close')}
                                    className="flex size-9 items-center justify-center rounded-full text-zinc-500 hover:bg-black/5 dark:text-zinc-400 dark:hover:bg-white/10 cursor-pointer"
                                >
                                    <Icon name="close" className="text-xl" />
                                </button>
                            </header>
                            <div className="min-h-0 flex-1 overflow-y-auto p-3">
                                <NotificationsList onNavigate={() => setOpen(false)} />
                            </div>
                        </section>
                    </>,
                    document.body,
                )}
        </>
    );
}
