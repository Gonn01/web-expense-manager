import { describe, expect, it } from 'vitest';
import { userRealtimeChannel } from './realtime-channel';

describe('userRealtimeChannel', () => {
    it('usa el canal privado del usuario', () => {
        expect(userRealtimeChannel(7)).toBe('private-notificaciones-7');
    });

    it.each([null, undefined, 0])('no devuelve canal sin usuario (%s)', (userId) => {
        expect(userRealtimeChannel(userId)).toBeNull();
    });
});
