import { useSnackbarStore } from '@/store/use-snackbar-store';
import { useDialogStore } from '@/store/use-dialog-store';
import { ERROR_PRESENTATION, STATUS_PRESENTATION, GENERIC_ERROR } from '@/utils/error-catalog';

/**
 * Convierte cualquier cosa que caiga en un `catch` (error de axios, error de
 * red, throw manual) en una forma consistente:
 *
 *   { isApiError, code, status, serverMessage, message, variant, icon, title, tone, raw }
 *
 * `message` ya es el texto amigable listo para mostrar. El resto de la app
 * puede seguir leyendo `err.message` y ahora recibe algo útil.
 */
export function normalizeApiError(error) {
    // Ya normalizado (p. ej. reintento): devolver tal cual.
    if (error?.isApiError) return error;

    const response = error?.response;
    const status = response?.status ?? (error?.request ? 0 : undefined);
    const body = response?.data ?? {};
    const code = body.code ?? null;
    const serverMessage =
        typeof body.error === 'string'
            ? body.error
            : typeof body.message === 'string'
              ? body.message
              : null;

    const preset =
        (code && ERROR_PRESENTATION[code]) ||
        (status != null && STATUS_PRESENTATION[status]) ||
        GENERIC_ERROR;

    const message = preset.message || serverMessage || GENERIC_ERROR.message;

    const normalized = new Error(message);
    normalized.isApiError = true;
    normalized.code = code;
    normalized.status = status ?? null;
    normalized.serverMessage = serverMessage;
    normalized.variant = preset.variant ?? 'snackbar';
    normalized.icon = preset.icon ?? (normalized.variant === 'dialog' ? undefined : 'error');
    normalized.title = preset.title ?? GENERIC_ERROR.title;
    normalized.tone = preset.tone ?? 'error';
    normalized.details = body.details ?? null;
    normalized.raw = error;
    return normalized;
}

// Dedupe: evita mostrar dos veces el mismo mensaje en una ráfaga corta
// (interceptor + catch manual, StrictMode, lote de requests que fallan igual).
let lastKey = null;
let lastAt = 0;
const DEDUPE_MS = 4000;

/**
 * Muestra un error al usuario según su `variant` (snackbar o dialog).
 * Lo llama automáticamente el interceptor de axios para cualquier request
 * fallida; también se puede llamar a mano para errores que no son de la API.
 */
export function notifyError(error, { silent = false } = {}) {
    if (silent) return normalizeApiError(error);

    const err = normalizeApiError(error);
    const key = `${err.variant}:${err.title}:${err.message}`;
    const now = Date.now();
    if (key === lastKey && now - lastAt < DEDUPE_MS) return err;
    lastKey = key;
    lastAt = now;

    if (err.variant === 'dialog') {
        useDialogStore.getState().alert({ title: err.title, message: err.message, tone: err.tone });
    } else {
        useSnackbarStore.getState().show(err.message, 'error', err.icon);
    }
    return err;
}
