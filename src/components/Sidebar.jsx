import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback, useMemo } from 'react';
import Icon from './Icon';
import useAuth from '@/store/use-auth-store';
import { useCompartidosStore } from '@/store/use-compartidos-store';
import { useEntitiesStore } from '@/store/use-entities-store';
import { useNotificacionesStore } from '@/store/use-notificaciones-store';
import { useUIStore } from '@/store/use-ui-store';
import { buildNotification } from '@/utils/notifications';
import { usePusherChannel } from '@/hooks/use-pusher-channel';
import { userRealtimeChannel } from '@/utils/realtime-channel';
import { useMediaQuery, DESKTOP_QUERY } from '@/hooks/use-media-query';
import { useSnackbarStore } from '@/store/use-snackbar-store';
import Snackbar from './Snackbar';
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
    const [notification, setNotification] = useState(null);
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

    const handleNuevo = useCallback(() => {
        setPendingCount((c) => c + 1);
        setNotification(t('common.youReceivedANewSharedExpense'));
    }, [setPendingCount]);

    const handleAprobado = useCallback(({ receiverName, gastoName } = {}) => {
        const quien = receiverName || t('common.aUser');
        const que = gastoName ? ` "${gastoName}"` : '';
        useSnackbarStore
            .getState()
            .show(t('realtime.expenseAccepted', { who: quien, expense: que }), 'success');
    }, []);

    const handleRechazado = useCallback(
        ({ receiverName, gastoName } = {}) => {
            const quien = receiverName || t('common.aUser');
            const que = gastoName ? ` "${gastoName}"` : '';
            loadPendingCount(token);
            useSnackbarStore
                .getState()
                .show(t('realtime.expenseRejected', { who: quien, expense: que }), 'error');
        },
        [loadPendingCount, token],
    );

    const handleDescartado = useCallback(
        ({ actorId, actorName } = {}) => {
            loadPendingCount(token);
            if (String(actorId) === String(user?.id)) return;
            const quien = actorName || t('common.theOtherPerson');
            useSnackbarStore.getState().show(t('realtime.expenseDiscarded', { who: quien }));
        },
        [loadPendingCount, token, user?.id],
    );

    const handleDesvinculado = useCallback(
        ({ actorName, gastoName, confirmedPayments } = {}) => {
            loadPendingCount(token);
            const quien = actorName || t('common.theOtherPerson');
            const que = gastoName ? `"${gastoName}"` : t('realtime.anExpense');
            const confirmados = confirmedPayments > 0 ? t('realtime.expenseUnsharedConfirmed') : '';
            useSnackbarStore
                .getState()
                .show(
                    `${t('realtime.expenseUnshared', { who: quien, expense: que })}${confirmados}`,
                );
        },
        [loadPendingCount, token],
    );

    const handlePagoPendiente = useCallback(
        ({ actorName } = {}) => {
            setPendingPaymentsCount((c) => c + 1);
            const mensaje = actorName
                ? t('realtime.paymentPending', { who: actorName })
                : t('common.youHaveAPaymentToConfirmIn');
            useSnackbarStore.getState().show(mensaje, 'success', 'pending_actions');
        },
        [setPendingPaymentsCount],
    );

    const handlePagoConfirmado = useCallback(({ actorName } = {}) => {
        const quien = actorName || t('common.theOtherPerson');
        useSnackbarStore.getState().show(t('realtime.paymentConfirmed', { who: quien }), 'success');
    }, []);

    const handlePagoRechazado = useCallback(({ actorName } = {}) => {
        const quien = actorName || t('common.theOtherPerson');
        useSnackbarStore.getState().show(t('realtime.paymentRejected', { who: quien }), 'error');
    }, []);

    const handlePagoRetirado = useCallback(
        ({ actorName } = {}) => {
            const quien = actorName || t('common.theOtherPerson');
            loadPendingCount(token);
            useSnackbarStore.getState().show(t('realtime.paymentWithdrawn', { who: quien }));
        },
        [loadPendingCount, token],
    );

    const handleReversionSolicitada = useCallback(
        ({ actorName } = {}) => {
            const quien = actorName || t('common.theOtherPerson');
            setPendingPaymentsCount((c) => c + 1);
            useSnackbarStore
                .getState()
                .show(t('realtime.reversalRequested', { who: quien }), 'success', 'undo');
        },
        [setPendingPaymentsCount],
    );

    const handleReversionCancelada = useCallback(
        ({ actorName } = {}) => {
            const quien = actorName || t('common.theOtherPerson');
            loadPendingCount(token);
            useSnackbarStore.getState().show(t('realtime.reversalCancelled', { who: quien }));
        },
        [loadPendingCount, token],
    );

    const handleReversionAceptada = useCallback(({ actorName } = {}) => {
        const quien = actorName || t('common.theOtherPerson');
        useSnackbarStore.getState().show(t('realtime.reversalAccepted', { who: quien }), 'success');
    }, []);

    const handleReversionRechazada = useCallback(({ actorName } = {}) => {
        const quien = actorName || t('common.theOtherPerson');
        useSnackbarStore.getState().show(t('realtime.reversalRejected', { who: quien }), 'error');
    }, []);

    const handleEdicionSolicitada = useCallback(
        ({ actorName, gastoName } = {}) => {
            const quien = actorName || t('common.theOtherPerson');
            const que = ` ${gastoName ? `"${gastoName}"` : t('realtime.anExpense')}`;
            setPendingPaymentsCount((c) => c + 1);
            useSnackbarStore
                .getState()
                .show(t('realtime.editRequested', { who: quien, expense: que }), 'success', 'edit');
        },
        [setPendingPaymentsCount],
    );

    const handleEdicionCancelada = useCallback(
        ({ actorName } = {}) => {
            const quien = actorName || t('common.theOtherPerson');
            loadPendingCount(token);
            useSnackbarStore.getState().show(t('realtime.editCancelled', { who: quien }));
        },
        [loadPendingCount, token],
    );

    const handleEdicionAprobada = useCallback(
        ({ actorId, actorName, gastoName } = {}) => {
            if (String(actorId) === String(user?.id)) return;
            const quien = actorName || t('common.theOtherPerson');
            const que = gastoName ? t('realtime.ofExpense', { expense: gastoName }) : '';
            useSnackbarStore
                .getState()
                .show(t('realtime.editApproved', { who: quien, expense: que }), 'success');
        },
        [user?.id],
    );

    const handleEdicionRechazada = useCallback(({ actorName, gastoName } = {}) => {
        const quien = actorName || t('common.theOtherPerson');
        const que = gastoName ? t('realtime.ofExpense', { expense: gastoName }) : '';
        useSnackbarStore
            .getState()
            .show(t('realtime.editRejected', { who: quien, expense: que }), 'error');
    }, []);

    const handleNotificacionNueva = useCallback(() => {
        loadNotificaciones(token);
    }, [loadNotificaciones, token]);

    const showNotice = useCallback((event, data) => {
        const notice = buildNotification(event, data);
        if (notice) useSnackbarStore.getState().show(notice.message, notice.tone, notice.icon);
    }, []);

    const handleVinculo = useCallback(
        (event, data) => {
            useEntitiesStore.getState().loadEntities(token);
            showNotice(event, data);
        },
        [showNotice, token],
    );

    const pusherEvents = useMemo(
        () => ({
            'notificacion.nueva': handleNotificacionNueva,
            'entidad.vinculada': (data) => handleVinculo('entidad.vinculada', data),
            'entidad.desvinculada': (data) => handleVinculo('entidad.desvinculada', data),
            'gasto.postergado': (data) => showNotice('gasto.postergado', data),
            'gasto.postergacion_quitada': (data) => showNotice('gasto.postergacion_quitada', data),
            'compartido.nuevo': handleNuevo,
            'compartido.aprobado': handleAprobado,
            'compartido.rechazado': handleRechazado,
            'compartido.descartado': handleDescartado,
            'compartido.desvinculado': handleDesvinculado,
            'pago.pendiente': handlePagoPendiente,
            'pago.confirmado': handlePagoConfirmado,
            'pago.rechazado': handlePagoRechazado,
            'pago.retirado': handlePagoRetirado,
            'pago.reversion_solicitada': handleReversionSolicitada,
            'pago.reversion_cancelada': handleReversionCancelada,
            'pago.reversion_aceptada': handleReversionAceptada,
            'pago.reversion_rechazada': handleReversionRechazada,
            'edicion.solicitada': handleEdicionSolicitada,
            'edicion.cancelada': handleEdicionCancelada,
            'edicion.aprobada': handleEdicionAprobada,
            'edicion.rechazada': handleEdicionRechazada,
        }),
        [
            handleNotificacionNueva,
            handleVinculo,
            showNotice,
            handleEdicionSolicitada,
            handleEdicionCancelada,
            handleEdicionAprobada,
            handleEdicionRechazada,
            handleNuevo,
            handleAprobado,
            handleRechazado,
            handleDescartado,
            handleDesvinculado,
            handlePagoPendiente,
            handlePagoConfirmado,
            handlePagoRechazado,
            handlePagoRetirado,
            handleReversionSolicitada,
            handleReversionCancelada,
            handleReversionAceptada,
            handleReversionRechazada,
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
            {notification && (
                <Snackbar message={notification} onClose={() => setNotification(null)} />
            )}
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
