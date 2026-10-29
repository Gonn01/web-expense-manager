const KEY = 'auth:session-expired';

export function markSessionExpired() {
    try {
        sessionStorage.setItem(KEY, '1');
    } catch {}
}

export function isSessionExpiredMarked() {
    try {
        return sessionStorage.getItem(KEY) === '1';
    } catch {
        return false;
    }
}

export function clearSessionExpired() {
    try {
        sessionStorage.removeItem(KEY);
    } catch {}
}
