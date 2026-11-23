import Pusher from 'pusher-js';
import { authorizeRealtimeChannel } from '@/services/api';
import useAuth from '@/store/use-auth-store';
import { createPusherClient } from './create-pusher-client';

export const pusherClient = createPusherClient(Pusher, {
    key: import.meta.env.VITE_PUSHER_KEY,
    cluster: import.meta.env.VITE_PUSHER_CLUSTER,
    authorize: (socketId, channelName) =>
        authorizeRealtimeChannel(socketId, channelName, useAuth.getState().token),
});
