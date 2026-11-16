import { ThemeMode, THEME_MODE_LABELS } from '@/utils/enums';
import Icon from '@/components/Icon';

const THEME_ICONS = Object.freeze({
    [ThemeMode.SYSTEM]: 'contrast',
    [ThemeMode.LIGHT]: 'light_mode',
    [ThemeMode.DARK]: 'dark_mode',
});

export function AparienciaCard({ themeMode, setThemeMode }) {
    return (
        <div className="rounded-2xl border border-black/10 dark:border-white/10 p-4 bg-white/70 dark:bg-background-dark/70">
            <h2 className="text-base font-medium mb-1 text-slate-900 dark:text-white">
                Apariencia
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                Elegí el tema de la aplicación. Se guarda en este navegador.
            </p>

            <div
                role="radiogroup"
                aria-label="Tema"
                className="flex h-10 items-center rounded-lg bg-black/5 dark:bg-white/10 p-1"
            >
                {Object.values(ThemeMode).map((mode) => (
                    <label
                        key={mode}
                        className="flex cursor-pointer h-full grow items-center justify-center gap-1.5 rounded-md px-2 has-checked:bg-white dark:has-checked:bg-background-dark has-checked:shadow-sm has-checked:text-slate-900 dark:has-checked:text-white text-slate-500 dark:text-slate-400 text-sm font-medium"
                    >
                        <Icon name={THEME_ICONS[mode]} className="text-lg" />
                        <span className="truncate">{THEME_MODE_LABELS[mode]}</span>
                        <input
                            className="invisible w-0"
                            name="theme-mode"
                            type="radio"
                            value={mode}
                            checked={themeMode === mode}
                            onChange={() => setThemeMode(mode)}
                        />
                    </label>
                ))}
            </div>
        </div>
    );
}
