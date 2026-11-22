import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.stubGlobal('localStorage', {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
});

const { default: useAuth } = await import('@/store/use-auth-store');
const { beginScreenRequest, hasScreenCache, useScreenCacheStore } =
    await import('@/store/use-screen-cache-store');

const store = () => useScreenCacheStore.getState();

describe('useScreenCacheStore', () => {
    beforeEach(() => {
        useAuth.setState({ token: 'token-a' });
        store().reset();
    });

    it('guarda un valor y lo marca como cacheado', () => {
        expect(hasScreenCache('pantalla')).toBe(false);
        store().write('token-a', 'pantalla', [1], []);
        expect(store().entries.pantalla).toEqual([1]);
        expect(hasScreenCache('pantalla')).toBe(true);
    });

    it('conserva un valor cacheado falsy', () => {
        store().write('token-a', 'total', 0, 5);
        store().write('token-a', 'total', (current) => current + 1, 5);
        expect(store().entries.total).toBe(1);
    });

    it('usa el valor inicial en la primera actualización funcional', () => {
        store().write('token-a', 'lista', (current) => [...current, 1], []);
        expect(store().entries.lista).toEqual([1]);
    });

    it('vacía el cache cuando cambia el token', () => {
        store().write('token-a', 'pantalla', [1], []);
        useAuth.setState({ token: 'token-b' });
        expect(hasScreenCache('pantalla')).toBe(false);
    });

    it('descarta una respuesta tardía de la sesión anterior', () => {
        useAuth.setState({ token: 'token-b' });
        store().write('token-a', 'pantalla', ['datos de otra cuenta'], []);
        expect(hasScreenCache('pantalla')).toBe(false);
    });

    it('solo considera vigente el último pedido de cada clave', () => {
        const first = beginScreenRequest('pantalla');
        const other = beginScreenRequest('otra');
        const second = beginScreenRequest('pantalla');
        expect(first()).toBe(false);
        expect(second()).toBe(true);
        expect(other()).toBe(true);
    });

    it('invalida los pedidos en curso al vaciar el cache', () => {
        const request = beginScreenRequest('pantalla');
        store().reset();
        expect(request()).toBe(false);
    });
});
