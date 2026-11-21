import { describe, expect, it, vi } from 'vitest';
import { ShareOutcome, canShareText, shareText } from './share-text';

const TEXTO = '*Cuentas de noviembre de 2026*';

const abortError = () => Object.assign(new Error('cerrado'), { name: 'AbortError' });

describe('canShareText', () => {
    it('soporta compartir si navigator.share es una función y no hay canShare', () => {
        expect(canShareText({ share: vi.fn() }, TEXTO)).toBe(true);
    });

    it('soporta compartir si canShare devuelve true para el texto', () => {
        const canShare = vi.fn(() => true);

        expect(canShareText({ share: vi.fn(), canShare }, TEXTO)).toBe(true);
        expect(canShare).toHaveBeenCalledWith({ text: TEXTO });
    });

    it('no soporta compartir sin navigator', () => {
        expect(canShareText(undefined, TEXTO)).toBe(false);
    });

    it('no soporta compartir sin navigator.share', () => {
        expect(canShareText({}, TEXTO)).toBe(false);
    });

    it('no soporta compartir si canShare devuelve false', () => {
        expect(canShareText({ share: vi.fn(), canShare: () => false }, TEXTO)).toBe(false);
    });

    it('no soporta compartir si canShare tira un error', () => {
        const canShare = () => {
            throw new TypeError('no soportado');
        };

        expect(canShareText({ share: vi.fn(), canShare }, TEXTO)).toBe(false);
    });
});

describe('shareText', () => {
    it('compartir ok devuelve "shared" y manda el texto', async () => {
        const share = vi.fn(async () => {});

        await expect(shareText(TEXTO, { share })).resolves.toBe(ShareOutcome.SHARED);
        expect(share).toHaveBeenCalledWith({ text: TEXTO });
    });

    it('llama a share en el mismo paso del clic, sin esperar nada antes', () => {
        const share = vi.fn(async () => {});

        shareText(TEXTO, { share });

        expect(share).toHaveBeenCalledTimes(1);
    });

    it('si el usuario cierra el menú (AbortError) devuelve "cancelled", no un error', async () => {
        const share = vi.fn(async () => {
            throw abortError();
        });

        await expect(shareText(TEXTO, { share })).resolves.toBe(ShareOutcome.CANCELLED);
    });

    it('otro error devuelve "error"', async () => {
        const share = vi.fn(async () => {
            throw Object.assign(new Error('no permitido'), { name: 'NotAllowedError' });
        });

        await expect(shareText(TEXTO, { share })).resolves.toBe(ShareOutcome.ERROR);
    });

    it('sin soporte devuelve "unavailable" y no intenta compartir', async () => {
        const share = vi.fn();

        await expect(shareText(TEXTO, { share, canShare: () => false })).resolves.toBe(
            ShareOutcome.UNAVAILABLE,
        );
        expect(share).not.toHaveBeenCalled();
    });
});
