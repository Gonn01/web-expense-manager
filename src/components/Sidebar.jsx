import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Icon from './Icon';
import useAuth from '@/store/use-auth-store';
import { useCompartidosStore } from '@/store/use-compartidos-store';
import { useEntitiesStore } from '@/store/use-entities-store';
import { useNotificacionesStore } from '@/store/use-notificaciones-store';
import { useUIStore } from '@/store/use-ui-store';
import { buildNotification, takeAnnounceable } from '@/utils/notifications';
import { usePusherChannel } from '@/hooks/use-pusher-channel';
import { userRealtimeChannel } from '@/utils/realtime-channel';
import { useMediaQuery, DESKTOP_QUERY } from '@/hooks/use-media-query';
import { useSnackbarStore } from '@/store/use-snackbar-store';
import UserAvatar from './UserAvatar';
import ConfirmDeleteModal from './modals/ConfirmDeleteModal';
import { t } from '@/i18n';

export default function Sidebar() {
    const base = 'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium leading-normal';
    const idle = 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5';
    const active = 'bg-primary/20 text-primary';

    const { user, logout, token } = useAuth();
    const navigate = useNavigate();
    const {
        pendingCount,
        pendingPaymentsCount,
        setPendingCount,
        setPendingPaymentsCount,
        loadPendingCount,
    } = useCompartidosStore();
    const loadNotificaciones = useNotificacionesStore((s) => s.load);
    const resetNotificaciones = useNotificacionesStore((s) => s.reset);
    const isDesktop = useMediaQuery(DESKTOP_QUERY);
    const collapsedPreference = useUIStore((s) => s.sidebarCollapsed);
    const collapsed = collapsedPreference && isDesktop;
    const toggleSidebar = useUIStore((s) => s.toggleSidebar);
    const mobileOpen = useUIStore((s) => s.mobileSidebarOpen);
    const setMobileOpen = useUIStore((s) => s.setMobileSidebarOpen);
    const closeMobile = useCallback(() => setMobileOpen(false), [setMobileOpen]);
    const pendingNoticeIds = useRef(new Set());
    const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

    useEffect(() => {
        loadPendingCount(token);
    }, [token, loadPendingCount]);

    useEffect(() => {
        resetNotificaciones();
        loadNotificaciones(token);
    }, [token, resetNotificaciones, loadNotificaciones]);

    useEffect(() => {
        if (isDesktop) closeMobile();
    }, [isDesktop, closeMobile]);

    useEffect(() => {
        if (!mobileOpen) return;
        const onKey = (e) => e.key === 'Escape' && closeMobile();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [mobileOpen, closeMobile]);

    const increasePendingCount = useCallback(() => {
        setPendingCount((c) => c + 1);
    }, [setPendingCount]);

    const increasePendingPayments = useCallback(() => {
        setPendingPaymentsCount((c) => c + 1);
    }, [setPendingPaymentsCount]);

    const reloadPendingCount = useCallback(() => {
        loadPendingCount(token);
    }, [loadPendingCount, token]);

    const reloadEntities = useCallback(() => {
        useEntitiesStore.getState().loadEntities(token);
    }, [token]);

    const handleNotificacionNueva = useCallback(
        async ({ id } = {}) => {
            if (id != null) pendingNoticeIds.current.add(String(id));
            await loadNotificaciones(token);
            const { items } = useNotificacionesStore.getState();
            for (const item of takeAnnounceable(pendingNoticeIds.current, items)) {
                const notice = buildNotification(item.event, item.data);
                if (notice) {
                    useSnackbarStore.getState().show(notice.message, notice.tone, notice.icon);
                }
            }
        },
        [loadNotificaciones, token],
    );

    const pusherEvents = useMemo(
        () => ({
            'notificacion.nueva': handleNotificacionNueva,
            'entidad.vinculada': reloadEntities,
            'entidad.desvinculada': reloadEntities,
            'compartido.nuevo': increasePendingCount,
            'compartido.rechazado': reloadPendingCount,
            'compartido.descartado': reloadPendingCount,
            'compartido.desvinculado': reloadPendingCount,
            'pago.pendiente': increasePendingPayments,
            'pago.retirado': reloadPendingCount,
            'pago.reversion_solicitada': increasePendingPayments,
            'pago.reversion_cancelada': reloadPendingCount,
            'edicion.solicitada': increasePendingPayments,
            'edicion.cancelada': reloadPendingCount,
        }),
        [
            handleNotificacionNueva,
            reloadEntities,
            increasePendingCount,
            increasePendingPayments,
            reloadPendingCount,
        ],
    );

    usePusherChannel(userRealtimeChannel(user?.id), pusherEvents);

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const handleConfirmLogout = () => {
        setConfirmLogoutOpen(false);
        handleLogout();
    };

    const avatar = user?.avatar;
    const nombreVisible = user?.name;
    const email = user?.email;

    const navItems = [
        { to: '/app/dashboard', icon: 'dashboard', label: 'Dashboard' },
        { to: '/app/entidades', icon: 'account_balance', label: t('common.financialEntities') },
        { to: '/app/settlement', icon: 'history', label: t('common.settlementHistory') },
        {
            to: '/app/compartidos',
            icon: 'group',
            label: t('common.shared'),
            badge: pendingCount + pendingPaymentsCount,
        },
    ];

    const linkClass = (isActive) => `relative ${base} ${isActive ? active : idle}`;

    return (
        <>
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={closeMobile}
                    aria-hidden="true"
                />
            )}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex flex-col shrink-0 overflow-y-auto overflow-x-hidden whitespace-nowrap border-r border-black/10 dark:border-white/10 p-4 bg-background-light dark:bg-background-dark transition-[width,translate] duration-200 lg:relative lg:z-auto lg:translate-x-0 lg:bg-white/50 lg:dark:bg-background-dark ${
                    mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
                } ${collapsed ? 'w-20' : 'w-72 max-w-[85vw] lg:w-64'}`}
            >
                {isDesktop ? (
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        aria-label={collapsed ? t('common.expandMenu') : t('common.collapseMenu')}
                        title={collapsed ? t('common.expandMenu') : t('common.collapseMenu')}
                        className={`mb-5 flex size-7 shrink-0 self-end items-center justify-center rounded-full border border-black/10 dark:border-white/10 text-slate-500 dark:text-slate-300 hover:text-primary cursor-pointer transition-[margin] duration-200 ${
                            collapsed ? 'mr-2.5' : 'mr-0'
                        }`}
                    >
                        <Icon
                            name={collapsed ? 'chevron_right' : 'chevron_left'}
                            className="text-lg"
                        />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={closeMobile}
                        aria-label={t('common.closeMenu')}
                        title={t('common.closeMenu')}
                        className="mb-5 flex size-9 shrink-0 self-end items-center justify-center rounded-full border border-black/10 dark:border-white/10 text-slate-500 dark:text-slate-300 hover:text-primary cursor-pointer"
                    >
                        <Icon name="close" className="text-xl" />
                    </button>
                )}

                <div className="flex flex-col gap-4 w-full">
                    <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                        <UserAvatar src={avatar} name={nombreVisible} className="size-10 text-sm" />
                        {!collapsed && (
                            <div className="flex flex-col min-w-0">
                                <h1 className="text-slate-900 dark:text-white text-base font-medium leading-normal truncate">
                                    {nombreVisible}
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal truncate max-w-40">
                                    {email}
                                </p>
                            </div>
                        )}
                    </div>

                    <nav className="flex flex-col gap-2 mt-4 w-full">
                        {navItems.map(({ to, icon, label, badge }) => (
                            <NavLink
                                key={to}
                                to={to}
                                title={collapsed ? label : undefined}
                                onClick={closeMobile}
                                className={({ isActive }) => linkClass(isActive)}
                            >
                                <Icon name={icon} className="text-2xl" />
                                {!collapsed && <p className="flex-1">{label}</p>}
                                {badge > 0 && (
                                    <span
                                        className={`bg-emerald-700 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1 ${
                                            collapsed ? 'absolute -top-1 -right-1' : 'ml-auto'
                                        }`}
                                    >
                                        {badge}
                                    </span>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto pt-6 flex flex-col gap-1 w-full">
                    <NavLink
                        to="/app/configuracion"
                        title={collapsed ? t('common.settings') : undefined}
                        onClick={closeMobile}
                        className={({ isActive }) => linkClass(isActive)}
                    >
                        <Icon name="settings" className="text-2xl" />
                        {!collapsed && <p>{t('common.settings')}</p>}
                    </NavLink>
                    <button
                        onClick={() => {
                            closeMobile();
                            setConfirmLogoutOpen(true);
                        }}
                        title={collapsed ? t('common.signOut') : undefined}
                        className={`${linkClass(false)} text-left w-full`}
                    >
                        <Icon name="logout" className="text-2xl" />
                        {!collapsed && <p>{t('common.signOut')}</p>}
                    </button>
                </div>
            </aside>

            <ConfirmDeleteModal
                open={confirmLogoutOpen}
                title={t('common.signOut2')}
                message={t('common.youLlNeedToSignInAgain')}
                confirmLabel={t('common.signOut')}
                cancelLabel={t('common.cancel')}
                onConfirm={handleConfirmLogout}
                onCancel={() => setConfirmLogoutOpen(false)}
            />
        </>
    );
}
