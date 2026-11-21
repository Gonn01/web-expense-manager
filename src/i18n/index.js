import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';
import {
    normalizeLanguagePreference,
    resolveActiveLanguage,
    SOURCE_LANGUAGE,
    SUPPORTED_LANGUAGES,
    toIntlLocale,
} from '@/utils/locale';

const LANGUAGE_STORAGE_KEY = 'ui:language';

function browserLanguages() {
    if (typeof navigator === 'undefined') return [SOURCE_LANGUAGE];
    return navigator.languages?.length ? navigator.languages : [navigator.language];
}

export function getLanguagePreference() {
    try {
        return normalizeLanguagePreference(localStorage.getItem(LANGUAGE_STORAGE_KEY));
    } catch {
        return normalizeLanguagePreference(null);
    }
}

function activeLanguage(preference = getLanguagePreference()) {
    return resolveActiveLanguage(preference, browserLanguages());
}

function syncDocumentLanguage(language) {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = language;
    document.title = i18n.t('app.documentTitle');
}

i18n.use(initReactI18next).init({
    resources: { en: { translation: en }, es: { translation: es } },
    lng: activeLanguage(),
    fallbackLng: SOURCE_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: { escapeValue: false },
    returnNull: false,
});

syncDocumentLanguage(i18n.language);
i18n.on('languageChanged', syncDocumentLanguage);

if (typeof window !== 'undefined') {
    window.addEventListener('languagechange', () => {
        if (activeLanguage() !== i18n.language) window.location.reload();
    });
}

export function setLanguagePreference(preference) {
    const normalized = normalizeLanguagePreference(preference);
    try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
    } catch {
        return;
    }
    if (activeLanguage(normalized) !== i18n.language) window.location.reload();
}

export const t = (...args) => i18n.t(...args);
export const getIntlLocale = () => toIntlLocale(i18n.language);

export default i18n;
