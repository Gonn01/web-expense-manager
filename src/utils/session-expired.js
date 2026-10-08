// Aviso de "sesión vencida" que tiene que sobrevivir a la recarga hacia /login:
// el interceptor de axios lo deja marcado y la pantalla de login lo muestra.
// sessionStorage (no localStorage): vale solo para esta pestaña.
const KEY = 'auth:session-expired';

export function markSessionExpired() {
    try {
        sessionStorage.setItem(KEY, '1');
    } catch {
        /* noop */
    }
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
    } catch {
        /* noop */
    }
}
