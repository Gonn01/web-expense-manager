import { Link } from 'react-router-dom';
import Icon from './Icon';
import UserAvatar from './UserAvatar';
import useAuth from '@/store/use-auth-store';
import { useUIStore } from '@/store/use-ui-store';
import { useCompartidosStore } from '@/store/use-compartidos-store';

export default function MobileTopBar() {
    const { user } = useAuth();
    const setMobileOpen = useUIStore((s) => s.setMobileSidebarOpen);
    const pendingCount = useCompartidosStore((s) => s.pendingCount + s.pendingPaymentsCount);

    return (
        <header className="lg:hidden sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-background-dark/90 backdrop-blur px-3">
            <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Abrir menú"
                title="Abrir menú"
                className="relative flex size-10 items-center justify-center rounded-lg text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
            >
                <Icon name="menu" className="text-2xl" />
                {pendingCount > 0 && (
                    <span className="absolute top-1 right-1 size-2.5 rounded-full bg-emerald-600 ring-2 ring-white dark:ring-background-dark" />
                )}
            </button>

            <Link
                to="/app/dashboard"
                className="flex-1 min-w-0 truncate text-base font-bold text-slate-900 dark:text-white"
            >
                Expense Manager
            </Link>

            <Link to="/app/configuracion" aria-label="Configuración" title="Configuración">
                <UserAvatar src={user?.avatar} name={user?.name} className="size-8 text-xs" />
            </Link>
        </header>
    );
}
