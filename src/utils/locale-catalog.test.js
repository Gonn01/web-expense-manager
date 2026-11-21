import { describe, expect, it } from 'vitest';
import en from '@/i18n/locales/en.json';
import es from '@/i18n/locales/es.json';

function flatten(node, prefix = '', result = {}) {
    for (const [key, value] of Object.entries(node)) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object') flatten(value, path, result);
        else result[path] = value;
    }
    return result;
}

const placeholders = (text) => [...text.matchAll(/{{\s*(\w+)\s*}}/g)].map((m) => m[1]).sort();
const tags = (text) => [...text.matchAll(/<\/?(\w+)>/g)].map((m) => m[1]).sort();

describe('translation catalogs', () => {
    const spanish = flatten(es);
    const english = flatten(en);

    it('define the same keys in every language', () => {
        expect(Object.keys(english).sort()).toEqual(Object.keys(spanish).sort());
    });

    it('use the same placeholders in every language', () => {
        for (const [key, text] of Object.entries(spanish)) {
            expect([key, placeholders(english[key])]).toEqual([key, placeholders(text)]);
        }
    });

    it('use the same rich-text tags in every language', () => {
        for (const [key, text] of Object.entries(spanish)) {
            expect([key, tags(english[key])]).toEqual([key, tags(text)]);
        }
    });
});
