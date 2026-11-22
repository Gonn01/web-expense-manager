import Pusher from 'pusher-js';
import { createPusherClient } from './create-pusher-client';

export const pusherClient = createPusherClient(Pusher, {
    key: import.meta.env.VITE_PUSHER_KEY,
    cluster: import.meta.env.VITE_PUSHER_CLUSTER,
});
