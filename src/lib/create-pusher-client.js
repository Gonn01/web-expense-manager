export function createPusherClient(PusherClient, { key, cluster } = {}) {
    const appKey = key?.trim();
    const appCluster = cluster?.trim();

    if (!appKey || !appCluster) {
        console.warn(
            'Tiempo real desactivado: faltan VITE_PUSHER_KEY o VITE_PUSHER_CLUSTER en el entorno.',
        );
        return null;
    }

    return new PusherClient(appKey, { cluster: appCluster });
}
