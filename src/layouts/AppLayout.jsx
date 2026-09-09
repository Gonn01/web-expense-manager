import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import useAuth from '@/store/use-auth-store';
import { useEntitiesStore } from '@/store/use-entities-store';
import { useCategoriesStore } from '@/store/use-categories-store';
import { useReconcileStore } from '@/store/use-reconcile-store';
import { useEffect } from 'react';

export default function AppLayout() {
    const { token } = useAuth();
    const { loadEntities } = useEntitiesStore();
    const { loadCategories } = useCategoriesStore();
    const loadReconcileSession = useReconcileStore((s) => s.loadSession);

    useEffect(() => {
        if (token) {
            loadEntities(token);
            loadCategories(token);
            loadReconcileSession();
        }
    }, [loadEntities, loadCategories, loadReconcileSession, token]);

    return (
        <div className="font-display bg-background-light dark:bg-background-dark">
            <div className="flex h-screen w-full overflow-hidden">
                <Sidebar className="h-full shrink-0" />

                <main className="flex-1 overflow-y-auto flex flex-col p-1 sm:p-2 md:p-5">
                    <div className="mx-auto max-w-7xl w-full flex-1 min-h-0 flex flex-col">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
