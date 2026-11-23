export const userRealtimeChannel = (userId) => (userId ? `private-notificaciones-${userId}` : null);
