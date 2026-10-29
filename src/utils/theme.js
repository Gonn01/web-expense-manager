import { ThemeMode } from '@/utils/enums';

const DARK_QUERY = '(prefers-color-scheme: dark)';

export function systemPrefersDark() {
    return typeof window !== 'undefined' && window.matchMedia?.(DARK_QUERY).matches === true;
}

export function resolveIsDark(mode) {
    if (mode === ThemeMode.DARK) return true;
    if (mode === ThemeMode.LIGHT) return false;
    return systemPrefersDark();
}

export function applyTheme(mode) {
    document.documentElement.classList.toggle('dark', resolveIsDark(mode));
}

export function watchSystemTheme(onChange) {
    const media = window.matchMedia?.(DARK_QUERY);
    if (!media) return () => {};
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
}
