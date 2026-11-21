import { describe, expect, it } from 'vitest';
import {
    LanguagePreference,
    normalizeLanguagePreference,
    resolveActiveLanguage,
    resolveLanguage,
    toIntlLocale,
} from './locale';

describe('resolveLanguage', () => {
    it('usa el idioma base de un locale regional', () => {
        expect(resolveLanguage(['es-AR'])).toBe('es');
        expect(resolveLanguage(['en_GB'])).toBe('en');
    });

    it('respeta el orden de preferencias del navegador', () => {
        expect(resolveLanguage(['fr-FR', 'es-MX', 'en-US'])).toBe('es');
    });

    it('cae en inglés si ningún idioma está soportado', () => {
        expect(resolveLanguage(['fr-FR', 'de'])).toBe('en');
        expect(resolveLanguage([])).toBe('en');
        expect(resolveLanguage(undefined)).toBe('en');
    });
});

describe('normalizeLanguagePreference', () => {
    it('conserva una preferencia válida', () => {
        expect(normalizeLanguagePreference('en')).toBe(LanguagePreference.EN);
    });

    it('usa el sistema ante un valor desconocido o vacío', () => {
        expect(normalizeLanguagePreference('fr')).toBe(LanguagePreference.SYSTEM);
        expect(normalizeLanguagePreference(null)).toBe(LanguagePreference.SYSTEM);
    });
});

describe('resolveActiveLanguage', () => {
    it('la elección del usuario gana sobre el navegador', () => {
        expect(resolveActiveLanguage(LanguagePreference.ES, ['en-US'])).toBe('es');
        expect(resolveActiveLanguage(LanguagePreference.EN, ['es-AR'])).toBe('en');
    });

    it('con Sistema sigue al navegador', () => {
        expect(resolveActiveLanguage(LanguagePreference.SYSTEM, ['es-AR'])).toBe('es');
        expect(resolveActiveLanguage(LanguagePreference.SYSTEM, ['fr-FR'])).toBe('en');
    });
});

describe('toIntlLocale', () => {
    it('asigna a cada idioma su locale de formato', () => {
        expect(toIntlLocale('es')).toBe('es-AR');
        expect(toIntlLocale('en')).toBe('en-US');
    });

    it('usa el formato inglés para un idioma desconocido', () => {
        expect(toIntlLocale('fr')).toBe('en-US');
    });
});
