import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPusherClient } from './create-pusher-client';

class FakePusher {
    static instances = 0;

    constructor(key, options) {
        FakePusher.instances += 1;
        this.key = key;
        this.options = options;
    }
}

describe('createPusherClient', () => {
    let warn;

    beforeEach(() => {
        FakePusher.instances = 0;
        warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        warn.mockRestore();
    });

    it('crea el cliente con la clave y el cluster', () => {
        const client = createPusherClient(FakePusher, { key: 'clave', cluster: 'sa1' });

        expect(client).toBeInstanceOf(FakePusher);
        expect(client.key).toBe('clave');
        expect(client.options.cluster).toBe('sa1');
        expect(warn).not.toHaveBeenCalled();
    });

    it('autoriza el canal privado con la respuesta de la API', async () => {
        const authorize = vi.fn(async () => ({ auth: 'clave:firma' }));
        const client = createPusherClient(FakePusher, { key: 'clave', cluster: 'sa1', authorize });

        const result = await new Promise((resolve) => {
            client.options.channelAuthorization.customHandler(
                { socketId: '1.2', channelName: 'private-notificaciones-7' },
                (error, authorization) => resolve({ error, authorization }),
            );
        });

        expect(authorize).toHaveBeenCalledWith('1.2', 'private-notificaciones-7');
        expect(result).toEqual({ error: null, authorization: { auth: 'clave:firma' } });
    });

    it('informa a Pusher si la API rechaza la autorización', async () => {
        const failure = new Error('sin permiso');
        const client = createPusherClient(FakePusher, {
            key: 'clave',
            cluster: 'sa1',
            authorize: async () => {
                throw failure;
            },
        });

        const result = await new Promise((resolve) => {
            client.options.channelAuthorization.customHandler(
                { socketId: '1.2', channelName: 'private-notificaciones-8' },
                (error, authorization) => resolve({ error, authorization }),
            );
        });

        expect(result).toEqual({ error: failure, authorization: null });
    });

    it.each([
        ['sin clave', { cluster: 'sa1' }],
        ['con clave vacía', { key: '', cluster: 'sa1' }],
        ['con clave en blanco', { key: '   ', cluster: 'sa1' }],
        ['sin cluster', { key: 'clave' }],
        ['sin configuración', undefined],
    ])('no crea el cliente y avisa %s', (_caso, config) => {
        expect(createPusherClient(FakePusher, config)).toBeNull();
        expect(FakePusher.instances).toBe(0);
        expect(warn).toHaveBeenCalledOnce();
    });
});
