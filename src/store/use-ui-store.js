import { create } from 'zustand';
import { ThemeMode } from '@/utils/enums';

const STORAGE_KEY = 'ui:prefs';

const DEFAULTS = {
    sidebarCollapsed: false,
    balancesHidden: false,
    entitiesViewMode: 'list',
};

function readPrefs() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
    } catch {
        return { ...DEFAULTS };
    }
}

function persist(state) {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                sidebarCollapsed: state.sidebarCollapsed,
                balancesHidden: state.balancesHidden,
                entitiesViewMode: state.entitiesViewMode,
            }),
        );
    } catch {}
}

export const useUIStore = create((set) => ({
    ...readPrefs(),

    toggleSidebar: () =>
        set((s) => {
            const next = { sidebarCollapsed: !s.sidebarCollapsed };
            persist({ ...s, ...next });
            return next;
        }),

    toggleBalances: () =>
        set((s) => {
            const next = { balancesHidden: !s.balancesHidden };
            persist({ ...s, ...next });
            return next;
        }),

    setEntitiesViewMode: (mode) =>
        set((s) => {
            const next = { entitiesViewMode: mode === 'grid' ? 'grid' : 'list' };
            persist({ ...s, ...next });
            return next;
        }),

    setThemeMode: (mode) =>
        set((s) => {
            const next = {
                themeMode: Object.values(ThemeMode).includes(mode) ? mode : ThemeMode.SYSTEM,
            };
            persist({ ...s, ...next });
            return next;
        }),
}));
