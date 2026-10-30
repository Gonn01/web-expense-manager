import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback, useMemo } from 'react';
import Icon from './Icon';
import useAuth from '@/store/use-auth-store';
import { useCompartidosStore } from '@/store/use-compartidos-store';
import { useUIStore } from '@/store/use-ui-store';
import { usePusherChannel } from '@/hooks/use-pusher-channel';
import { useMediaQuery, DESKTOP_QUERY } from '@/hooks/use-media-query';
import { useSnackbarStore } from '@/store/use-snackbar-store';
import Snackbar from './Snackbar';
import UserAvatar from './UserAvatar';
import ConfirmDeleteModal from './modals/ConfirmDeleteModal';

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
        setNotification('Recibiste un nuevo gasto compartido');
    }, [setPendingCount]);

    const handleAprobado = useCallback(({ receiverName, gastoName } = {}) => {
        const quien = receiverName || 'Un usuario';
        const que = gastoName ? ` "${gastoName}"` : '';
        useSnackbarStore.getState().show(`${quien} ha aceptado tu gasto${que}`, 'success');
    }, []);

    const handlePagoPendiente = useCallback(() => {
        setPendingPaymentsCount((c) => c + 1);
        useSnackbarStore
            .getState()
            .show('Tenés un pago para confirmar en Compartidos', 'success', 'pending_actions');
    }, [setPendingPaymentsCount]);

    const handlePagoConfirmado = useCallback(({ actorName } = {}) => {
        const quien = actorName || 'La otra persona';
        useSnackbarStore.getState().show(`${quien} confirmó tu pago`, 'success');
    }, []);

    const handlePagoRechazado = useCallback(({ actorName } = {}) => {
        const quien = actorName || 'La otra persona';
        useSnackbarStore.getState().show(`${quien} rechazó tu pago`, 'error');
    }, []);

    const pusherEvents = useMemo(
        () => ({
            'compartido.nuevo': handleNuevo,
            'compartido.aprobado': handleAprobado,
            'pago.pendiente': handlePagoPendiente,
            'pago.confirmado': handlePagoConfirmado,
            'pago.rechazado': handlePagoRechazado,
        }),
        [
            handleNuevo,
            handleAprobado,
            handlePagoPendiente,
            handlePagoConfirmado,
            handlePagoRechazado,
        ],
    );

    usePusherChannel(user?.id ? `compartidos-${user.id}` : null, pusherEvents);

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
        { to: '/app/entidades', icon: 'account_balance', label: 'Entidades Financieras' },
        { to: '/app/settlement', icon: 'history', label: 'Historial de cuentas' },
        {
            to: '/app/compartidos',
            icon: 'group',
            label: 'Compartidos',
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
                        aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
                        title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
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
                        aria-label="Cerrar menú"
                        title="Cerrar menú"
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
                        title={collapsed ? 'Configuración' : undefined}
                        onClick={closeMobile}
                        className={({ isActive }) => linkClass(isActive)}
                    >
                        <Icon name="settings" className="text-2xl" />
                        {!collapsed && <p>Configuración</p>}
                    </NavLink>
                    <button
                        onClick={() => {
                            closeMobile();
                            setConfirmLogoutOpen(true);
                        }}
                        title={collapsed ? 'Cerrar sesión' : undefined}
                        className={`${linkClass(false)} text-left w-full`}
                    >
                        <Icon name="logout" className="text-2xl" />
                        {!collapsed && <p>Cerrar sesión</p>}
                    </button>
                </div>
            </aside>

            <ConfirmDeleteModal
                open={confirmLogoutOpen}
                title="¿Cerrar sesión?"
                message="Vas a tener que volver a iniciar sesión para acceder a tu cuenta."
                confirmLabel="Cerrar sesión"
                cancelLabel="Cancelar"
                onConfirm={handleConfirmLogout}
                onCancel={() => setConfirmLogoutOpen(false)}
            />
        </>
    );
}
