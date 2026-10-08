import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback, useMemo } from 'react';
import Icon from './Icon';
import useAuth from '@/store/use-auth-store';
import { useCompartidosStore } from '@/store/use-compartidos-store';
import { useUIStore } from '@/store/use-ui-store';
import { usePusherChannel } from '@/hooks/use-pusher-channel';
import { useSnackbarStore } from '@/store/use-snackbar-store';
import Snackbar from './Snackbar';
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
    const collapsed = useUIStore((s) => s.sidebarCollapsed);
    const toggleSidebar = useUIStore((s) => s.toggleSidebar);
    const [notification, setNotification] = useState(null);
    const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

    useEffect(() => {
        loadPendingCount(token);
    }, [token, loadPendingCount]);

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
        {
            to: '/app/entidades',
            icon: 'account_balance',
            label: 'Entidades Financieras',
            iconClass: 'text-primary',
            extraIdle: 'hover:text-primary',
        },
        { to: '/app/settlement', icon: 'history', label: 'Historial de cuentas' },
        {
            to: '/app/compartidos',
            icon: 'group',
            label: 'Compartidos',
            badge: pendingCount + pendingPaymentsCount,
        },
    ];

    const linkClass = (isActive, extraIdle = '') =>
        `relative ${base} ${isActive ? active : `${idle} ${extraIdle}`} ${
            collapsed ? 'justify-center px-2' : ''
        }`;

    return (
        <>
            {notification && (
                <Snackbar message={notification} onClose={() => setNotification(null)} />
            )}
            <aside
                className={`relative flex flex-col border-r border-black/10 dark:border-white/10 p-4 bg-white/50 dark:bg-background-dark transition-[width] duration-200 ${
                    collapsed ? 'w-20 items-center' : 'w-64'
                }`}
            >
                <button
                    type="button"
                    onClick={toggleSidebar}
                    aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
                    title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
                    className={`mb-2 flex size-7 items-center justify-center rounded-full border border-black/10 dark:border-white/10 text-slate-500 dark:text-slate-300 hover:text-primary cursor-pointer ${
                        collapsed ? 'self-center' : 'self-end'
                    }`}
                >
                    <Icon name={collapsed ? 'chevron_right' : 'chevron_left'} className="text-lg" />
                </button>

                <div className="flex flex-col gap-4 w-full">
                    {/* Perfil del usuario */}
                    <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                        <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 shrink-0"
                            aria-label="User profile picture"
                            style={{ backgroundImage: `url(${avatar})` }}
                        />
                        {!collapsed && (
                            <div className="flex flex-col">
                                <h1 className="text-slate-900 dark:text-white text-base font-medium leading-normal">
                                    {nombreVisible}
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal truncate max-w-40">
                                    {email}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Navegación */}
                    <nav className="flex flex-col gap-2 mt-4 w-full">
                        {navItems.map(({ to, icon, label, iconClass, extraIdle, badge }) => (
                            <NavLink
                                key={to}
                                to={to}
                                title={collapsed ? label : undefined}
                                className={({ isActive }) => linkClass(isActive, extraIdle)}
                            >
                                <Icon name={icon} className={`text-2xl ${iconClass ?? ''}`} />
                                {!collapsed && <p className="flex-1">{label}</p>}
                                {badge > 0 && (
                                    <span
                                        className={`bg-primary text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1 ${
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

                {/* Sección inferior */}
                <div className="mt-auto flex flex-col gap-1 w-full">
                    <NavLink
                        to="/app/configuracion"
                        title={collapsed ? 'Configuración' : undefined}
                        className={({ isActive }) => linkClass(isActive)}
                    >
                        <Icon name="settings" className="text-2xl" />
                        {!collapsed && <p>Configuración</p>}
                    </NavLink>
                    <button
                        onClick={() => setConfirmLogoutOpen(true)}
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
