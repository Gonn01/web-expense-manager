import Icon from '@/components/Icon';
import { t } from '@/i18n';
import { LanguagePreference } from '@/utils/locale';

const LANGUAGE_OPTIONS = Object.freeze([
    { value: LanguagePreference.SYSTEM, labelKey: 'language.system', icon: 'language' },
    { value: LanguagePreference.ES, labelKey: 'language.spanish', icon: 'translate' },
    { value: LanguagePreference.EN, labelKey: 'language.english', icon: 'translate' },
]);

export function IdiomaCard({ languagePreference, onChangeLanguage }) {
    return (
        <div className="rounded-2xl border border-black/10 dark:border-white/10 p-4 bg-white/70 dark:bg-background-dark/70">
            <h2 className="text-base font-medium mb-1 text-slate-900 dark:text-white">
                {t('language.title')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                {t('language.subtitle')}
            </p>

            <div
                role="radiogroup"
                aria-label={t('language.title')}
                className="flex h-10 items-center rounded-lg bg-black/5 dark:bg-white/10 p-1"
            >
                {LANGUAGE_OPTIONS.map(({ value, labelKey, icon }) => (
                    <label
                        key={value}
                        className="flex cursor-pointer h-full grow items-center justify-center gap-1.5 rounded-md px-2 has-checked:bg-white dark:has-checked:bg-background-dark has-checked:shadow-sm has-checked:text-slate-900 dark:has-checked:text-white text-slate-500 dark:text-slate-400 text-sm font-medium"
                    >
                        <Icon name={icon} className="text-lg" />
                        <span className="truncate">{t(labelKey)}</span>
                        <input
                            className="invisible w-0"
                            name="language-preference"
                            type="radio"
                            value={value}
                            checked={languagePreference === value}
                            onChange={() => onChangeLanguage(value)}
                        />
                    </label>
                ))}
            </div>
        </div>
    );
}
