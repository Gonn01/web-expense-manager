import { useSnackbarStore } from '@/store/use-snackbar-store';
import { useDialogStore } from '@/store/use-dialog-store';
import { ERROR_PRESENTATION, STATUS_PRESENTATION, GENERIC_ERROR } from '@/utils/error-catalog';

export function normalizeApiError(error) {
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

let lastKey = null;
let lastAt = 0;
const DEDUPE_MS = 4000;

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
