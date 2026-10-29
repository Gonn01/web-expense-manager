import { useEffect } from 'react';
import { pusherClient } from '@/lib/pusher';

const subCounts = new Map();

function acquire(channelName) {
    subCounts.set(channelName, (subCounts.get(channelName) || 0) + 1);
    return pusherClient.subscribe(channelName);
}

function release(channelName) {
    const next = (subCounts.get(channelName) || 1) - 1;
    if (next <= 0) {
        subCounts.delete(channelName);
        pusherClient.unsubscribe(channelName);
    } else {
        subCounts.set(channelName, next);
    }
}

export function usePusherChannel(channelName, events) {
    useEffect(() => {
        if (!channelName) return;

        const channel = acquire(channelName);

        for (const [event, handler] of Object.entries(events)) {
            channel.bind(event, handler);
        }

        return () => {
            for (const [event, handler] of Object.entries(events)) {
                channel.unbind(event, handler);
            }
            release(channelName);
        };
    }, [channelName, events]);
}
