import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { t } from '@/i18n';
import { normalizeApiError, notifyError } from '@/services/error-handler';
import { useDialogStore } from '@/store/use-dialog-store';
import { useSnackbarStore } from '@/store/use-snackbar-store';

const apiError = (status, data) => ({ response: { status, data } });

describe('normalizeApiError', () => {
    it('no vuelve a normalizar un error ya normalizado', () => {
        const err = normalizeApiError(apiError(400, {}));

        expect(normalizeApiError(err)).toBe(err);
    });

    it('prioriza la presentación del código sobre la del status', () => {
        const err = normalizeApiError(apiError(503, { code: 'GASTO_NOT_FOUND', error: 'server' }));

        expect(err).toMatchObject({
            isApiError: true,
            code: 'GASTO_NOT_FOUND',
            status: 503,
            message: t('errors.codes.GASTO_NOT_FOUND.message'),
            variant: 'snackbar',
            serverMessage: 'server',
        });
    });

    it('usa el status si el código es desconocido', () => {
        const err = normalizeApiError(apiError(503, { code: 'CODIGO_DESCONOCIDO' }));

        expect(err.message).toBe(t('errors.status.503.message'));
    });

    it('muestra el texto del servidor si el código no tiene mensaje propio', () => {
        const err = normalizeApiError(
            apiError(409, { code: 'GASTO_CAMPO_NO_EDITABLE', error: 'Campo bloqueado' }),
        );

        expect(err).toMatchObject({
            message: 'Campo bloqueado',
            title: t('errors.codes.GASTO_CAMPO_NO_EDITABLE.title'),
            variant: 'dialog',
            tone: 'warning',
        });
    });

    it('acepta message como alternativa a error', () => {
        expect(normalizeApiError(apiError(401, { message: 'Token' })).serverMessage).toBe('Token');
    });

    it('ignora un error del servidor que no es texto', () => {
        expect(normalizeApiError(apiError(400, { error: { x: 1 } })).serverMessage).toBeNull();
    });

    it('conserva los detalles', () => {
        const details = { field: 'amount' };

        expect(normalizeApiError(apiError(409, { details })).details).toEqual(details);
    });

    it('marca status 0 si no hubo respuesta', () => {
        const err = normalizeApiError({ request: {} });

        expect(err.status).toBe(0);
        expect(err.message).toBe(t('errors.status.0.message'));
        expect(err.variant).toBe('dialog');
    });

    it('soporta un error sin datos', () => {
        expect(normalizeApiError(undefined)).toMatchObject({
            status: null,
            code: null,
            message: t('errors.generic.message'),
            variant: 'snackbar',
            icon: 'error',
        });
    });
});

describe('notifyError', () => {
    let now = Date.UTC(2026, 0, 1);
    const show = vi.fn();
    const alert = vi.fn();

    beforeEach(() => {
        now += 60000;
        vi.useFakeTimers();
        vi.setSystemTime(now);
        show.mockClear();
        alert.mockClear();
        useSnackbarStore.setState({ show });
        useDialogStore.setState({ alert });
    });

    afterEach(() => {
        now = Date.now();
        vi.useRealTimers();
    });

    it('en modo silencioso no muestra nada', () => {
        const err = notifyError(apiError(500, {}), { silent: true });

        expect(err.isApiError).toBe(true);
        expect(show).not.toHaveBeenCalled();
        expect(alert).not.toHaveBeenCalled();
    });

    it('abre un diálogo cuando el error lo pide', () => {
        notifyError(apiError(409, { code: 'GASTO_CAMPO_NO_EDITABLE', error: 'Campo bloqueado' }));

        expect(alert).toHaveBeenCalledWith({
            title: t('errors.codes.GASTO_CAMPO_NO_EDITABLE.title'),
            message: 'Campo bloqueado',
            tone: 'warning',
        });
        expect(show).not.toHaveBeenCalled();
    });

    it('muestra un snackbar en los demás casos', () => {
        notifyError(apiError(404, { code: 'GASTO_NOT_FOUND' }));

        expect(show).toHaveBeenCalledWith(
            t('errors.codes.GASTO_NOT_FOUND.message'),
            'error',
            'error',
        );
        expect(alert).not.toHaveBeenCalled();
    });

    it('no repite el mismo error dentro de la ventana', () => {
        notifyError(apiError(404, { code: 'GASTO_NOT_FOUND' }));
        vi.advanceTimersByTime(3999);
        notifyError(apiError(404, { code: 'GASTO_NOT_FOUND' }));

        expect(show).toHaveBeenCalledTimes(1);
    });

    it('vuelve a mostrarlo cuando pasa la ventana', () => {
        notifyError(apiError(404, { code: 'GASTO_NOT_FOUND' }));
        vi.advanceTimersByTime(4000);
        notifyError(apiError(404, { code: 'GASTO_NOT_FOUND' }));

        expect(show).toHaveBeenCalledTimes(2);
    });

    it('muestra errores distintos seguidos', () => {
        notifyError(apiError(404, { code: 'GASTO_NOT_FOUND' }));
        notifyError(apiError(404, { code: 'ENTIDAD_NOT_FOUND' }));

        expect(show).toHaveBeenCalledTimes(2);
    });

    it('trata como repetidos dos errores que muestran el mismo texto', () => {
        notifyError(apiError(404, { code: 'GASTO_NOT_FOUND', error: 'uno' }));
        notifyError(apiError(404, { code: 'GASTO_NOT_FOUND', error: 'dos' }));

        expect(show).toHaveBeenCalledTimes(1);
    });
});
