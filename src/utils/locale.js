export const SUPPORTED_LANGUAGES = Object.freeze(['en', 'es']);
export const UNSUPPORTED_BROWSER_LANGUAGE = 'en';
export const SOURCE_LANGUAGE = 'es';

export const LanguagePreference = Object.freeze({
    SYSTEM: 'system',
    ES: 'es',
    EN: 'en',
});

const INTL_LOCALES = Object.freeze({ en: 'en-US', es: 'es-AR' });

export function resolveLanguage(preferredLanguages) {
    for (const candidate of preferredLanguages ?? []) {
        const base = String(candidate).toLowerCase().split(/[-_]/)[0];
        if (SUPPORTED_LANGUAGES.includes(base)) return base;
    }
    return UNSUPPORTED_BROWSER_LANGUAGE;
}

export function normalizeLanguagePreference(value) {
    return Object.values(LanguagePreference).includes(value) ? value : LanguagePreference.SYSTEM;
}

export function resolveActiveLanguage(preference, preferredLanguages) {
    const normalized = normalizeLanguagePreference(preference);
    return normalized === LanguagePreference.SYSTEM
        ? resolveLanguage(preferredLanguages)
        : normalized;
}

export function toIntlLocale(language) {
    return INTL_LOCALES[language] ?? INTL_LOCALES[UNSUPPORTED_BROWSER_LANGUAGE];
}
