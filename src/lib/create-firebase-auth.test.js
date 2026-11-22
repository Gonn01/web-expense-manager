import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFirebaseAuth } from './create-firebase-auth';

const config = {
    apiKey: 'clave',
    authDomain: 'demo.firebaseapp.com',
    projectId: 'demo',
    appId: 'app',
};

describe('createFirebaseAuth', () => {
    let warn;
    let firebase;

    beforeEach(() => {
        warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        firebase = {
            initializeApp: vi.fn(() => 'app-instance'),
            getAuth: vi.fn(() => 'auth-instance'),
        };
    });

    afterEach(() => {
        warn.mockRestore();
    });

    it('inicia Firebase con la configuración completa', () => {
        expect(createFirebaseAuth(config, firebase)).toBe('auth-instance');
        expect(firebase.initializeApp).toHaveBeenCalledWith(config);
        expect(firebase.getAuth).toHaveBeenCalledWith('app-instance');
        expect(warn).not.toHaveBeenCalled();
    });

    it.each(['apiKey', 'authDomain', 'projectId', 'appId'])(
        'no inicia Firebase sin %s',
        (field) => {
            expect(createFirebaseAuth({ ...config, [field]: undefined }, firebase)).toBeNull();
            expect(firebase.initializeApp).not.toHaveBeenCalled();
            expect(warn).toHaveBeenCalledOnce();
        },
    );

    it('trata un valor en blanco como faltante', () => {
        expect(createFirebaseAuth({ ...config, apiKey: '   ' }, firebase)).toBeNull();
        expect(firebase.getAuth).not.toHaveBeenCalled();
    });

    it('no inicia Firebase sin configuración', () => {
        expect(createFirebaseAuth(undefined, firebase)).toBeNull();
        expect(firebase.initializeApp).not.toHaveBeenCalled();
    });
});
