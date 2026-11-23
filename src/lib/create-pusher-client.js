export function createPusherClient(PusherClient, { key, cluster, authorize } = {}) {
    const appKey = key?.trim();
    const appCluster = cluster?.trim();

    if (!appKey || !appCluster) {
        console.warn(
            'Tiempo real desactivado: faltan VITE_PUSHER_KEY o VITE_PUSHER_CLUSTER en el entorno.',
        );
        return null;
    }

    return new PusherClient(appKey, {
        cluster: appCluster,
        channelAuthorization: {
            customHandler: ({ socketId, channelName }, callback) => {
                Promise.resolve()
                    .then(() => authorize(socketId, channelName))
                    .then((authorization) => callback(null, authorization))
                    .catch((error) => callback(error, null));
            },
        },
    });
}
