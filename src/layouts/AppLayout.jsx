import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import MobileTopBar from '@/components/MobileTopBar';
import useAuth from '@/store/use-auth-store';
import { useEntitiesStore } from '@/store/use-entities-store';
import { useCategoriesStore } from '@/store/use-categories-store';
import { useSettlementStore } from '@/store/use-settlement-store';
import { useEffect } from 'react';

export default function AppLayout() {
    const { token } = useAuth();
    const { loadEntities } = useEntitiesStore();
    const { loadCategories } = useCategoriesStore();
    const loadSettlementSession = useSettlementStore((s) => s.loadSession);

    useEffect(() => {
        if (token) {
            loadEntities(token);
            loadCategories(token);
            loadSettlementSession();
        }
    }, [loadEntities, loadCategories, loadSettlementSession, token]);

    return (
        <div className="font-display bg-background-light dark:bg-background-dark">
            <div className="flex h-dvh w-full overflow-hidden">
                <Sidebar />

                <div className="flex flex-1 min-w-0 flex-col">
                    <MobileTopBar />

                    <main className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable] flex flex-col px-3 py-4 sm:p-4 lg:p-5">
                        <div className="mx-auto max-w-7xl w-full flex-1 min-h-0 flex flex-col">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
