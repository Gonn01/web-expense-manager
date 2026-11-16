import { useEffect } from 'react';
import { useUIStore } from '@/store/use-ui-store';
import { ThemeMode } from '@/utils/enums';
import { applyTheme, watchSystemTheme } from '@/utils/theme';

export function useThemeSync() {
    const themeMode = useUIStore((s) => s.themeMode);

    useEffect(() => {
        applyTheme(themeMode);
        if (themeMode !== ThemeMode.SYSTEM) return undefined;
        return watchSystemTheme(() => applyTheme(themeMode));
    }, [themeMode]);
}
