export const ERROR_PRESENTATION = Object.freeze({
    VALIDATION_ERROR: { variant: 'snackbar', icon: 'error' },

    GASTO_NOT_FOUND: { messageKey: 'errors.codes.GASTO_NOT_FOUND.message', variant: 'snackbar' },
    GASTO_POSTERGADO: {
        messageKey: 'errors.codes.GASTO_POSTERGADO.message',
        variant: 'snackbar',
        icon: 'schedule',
    },
    GASTO_PAGADO_NO_POSTERGABLE: {
        messageKey: 'errors.codes.GASTO_PAGADO_NO_POSTERGABLE.message',
        variant: 'snackbar',
        icon: 'schedule',
    },
    GASTO_NO_PENDIENTE_APROBACION: {
        messageKey: 'errors.codes.GASTO_NO_PENDIENTE_APROBACION.message',
        variant: 'snackbar',
    },
    GASTO_COMPARTIDO_NO_ASOCIADO: {
        messageKey: 'errors.codes.GASTO_COMPARTIDO_NO_ASOCIADO.message',
        variant: 'snackbar',
    },
    GASTO_COMPARTIDO_NO_RECHAZADO: {
        messageKey: 'errors.codes.GASTO_COMPARTIDO_NO_RECHAZADO.message',
        variant: 'snackbar',
    },
    GASTO_COMPARTIDO_DESVINCULADO: {
        messageKey: 'errors.codes.GASTO_COMPARTIDO_DESVINCULADO.message',
        variant: 'snackbar',
    },
    GASTO_COMPARTIDO_NO_RESTAURABLE: {
        messageKey: 'errors.codes.GASTO_COMPARTIDO_NO_RESTAURABLE.message',
        variant: 'snackbar',
    },
    GASTO_NO_COMPARTIBLE: {
        messageKey: 'errors.codes.GASTO_NO_COMPARTIBLE.message',
        variant: 'snackbar',
    },
    GASTO_NO_ACTIVO: {
        messageKey: 'errors.codes.GASTO_NO_ACTIVO.message',
        variant: 'snackbar',
    },
    GASTO_YA_SALDADO: {
        messageKey: 'errors.codes.GASTO_YA_SALDADO.message',
        variant: 'snackbar',
    },
    SIN_CUOTAS_PARA_REVERTIR: {
        messageKey: 'errors.codes.SIN_CUOTAS_PARA_REVERTIR.message',
        variant: 'snackbar',
    },
    LISTA_IDS_INVALIDA: {
        messageKey: 'errors.codes.LISTA_IDS_INVALIDA.message',
        variant: 'snackbar',
    },
    GASTO_ENTIDAD_NO_EDITABLE: {
        variant: 'dialog',
        titleKey: 'errors.codes.GASTO_ENTIDAD_NO_EDITABLE.title',
        tone: 'warning',
    },
    GASTO_CAMPO_NO_EDITABLE: {
        variant: 'dialog',
        titleKey: 'errors.codes.GASTO_CAMPO_NO_EDITABLE.title',
        tone: 'warning',
    },

    ENTIDAD_NOT_FOUND: {
        messageKey: 'errors.codes.ENTIDAD_NOT_FOUND.message',
        variant: 'snackbar',
    },
    ENTIDAD_FINANCIERA_NOT_FOUND: {
        messageKey: 'errors.codes.ENTIDAD_FINANCIERA_NOT_FOUND.message',
        variant: 'snackbar',
    },
    ENTIDAD_PAGO_NOT_FOUND: {
        messageKey: 'errors.codes.ENTIDAD_PAGO_NOT_FOUND.message',
        variant: 'snackbar',
    },
    ENTIDAD_NOT_FOUND_O_AJENA: {
        messageKey: 'errors.codes.ENTIDAD_NOT_FOUND_O_AJENA.message',
        variant: 'snackbar',
    },
    ENTIDAD_YA_EXISTE: {
        messageKey: 'errors.codes.ENTIDAD_YA_EXISTE.message',
        variant: 'snackbar',
    },
    ENTIDAD_O_NOMBRE_REQUERIDO: {
        messageKey: 'errors.codes.ENTIDAD_O_NOMBRE_REQUERIDO.message',
        variant: 'snackbar',
    },
    VINCULAR_CUENTA_PROPIA: {
        messageKey: 'errors.codes.VINCULAR_CUENTA_PROPIA.message',
        variant: 'snackbar',
    },
    ENTIDAD_YA_VINCULADA: { variant: 'snackbar' },

    USUARIO_NOT_FOUND: {
        messageKey: 'errors.codes.USUARIO_NOT_FOUND.message',
        variant: 'snackbar',
    },
    USUARIO_EMAIL_NOT_FOUND: {
        messageKey: 'errors.codes.USUARIO_EMAIL_NOT_FOUND.message',
        variant: 'snackbar',
    },
    CREDENCIALES_INVALIDAS: {
        messageKey: 'errors.codes.CREDENCIALES_INVALIDAS.message',
        variant: 'snackbar',
    },
    EMAIL_YA_REGISTRADO: {
        messageKey: 'errors.codes.EMAIL_YA_REGISTRADO.message',
        variant: 'snackbar',
    },

    NO_AUTORIZADO: {
        messageKey: 'errors.codes.NO_AUTORIZADO.message',
        variant: 'dialog',
        titleKey: 'errors.codes.NO_AUTORIZADO.title',
        tone: 'warning',
    },
    PAGO_PENDIENTE_NOT_FOUND: {
        messageKey: 'errors.codes.PAGO_PENDIENTE_NOT_FOUND.message',
        variant: 'snackbar',
    },
    PAGO_NOT_FOUND: {
        messageKey: 'errors.codes.PAGO_NOT_FOUND.message',
        variant: 'snackbar',
    },
    PAGO_REGISTRADO_POR_OTRO: {
        messageKey: 'errors.codes.PAGO_REGISTRADO_POR_OTRO.message',
        variant: 'snackbar',
    },
    GASTO_CUOTAS_CUBIERTAS: {
        messageKey: 'errors.codes.GASTO_CUOTAS_CUBIERTAS.message',
        variant: 'snackbar',
    },
    REVERSION_YA_SOLICITADA: {
        messageKey: 'errors.codes.REVERSION_YA_SOLICITADA.message',
        variant: 'snackbar',
    },
    REVERSION_NOT_FOUND: {
        messageKey: 'errors.codes.REVERSION_NOT_FOUND.message',
        variant: 'snackbar',
    },

    EDICION_NOT_FOUND: {
        messageKey: 'errors.codes.EDICION_NOT_FOUND.message',
        variant: 'snackbar',
    },
    EDICION_YA_SOLICITADA: {
        messageKey: 'errors.codes.EDICION_YA_SOLICITADA.message',
        variant: 'snackbar',
    },
    EDICION_SIN_CAMBIOS: {
        messageKey: 'errors.codes.EDICION_SIN_CAMBIOS.message',
        variant: 'snackbar',
    },

    SETTLEMENT_REQUIRED: {
        messageKey: 'errors.codes.SETTLEMENT_REQUIRED.message',
        variant: 'snackbar',
        icon: 'playlist_add_check',
    },
    NO_OPEN_SESSION: {
        messageKey: 'errors.codes.NO_OPEN_SESSION.message',
        variant: 'snackbar',
    },
    SETTLEMENT_EMPTY: {
        messageKey: 'errors.codes.SETTLEMENT_EMPTY.message',
        variant: 'snackbar',
        icon: 'playlist_add_check',
    },
    SNAPSHOT_NOT_FOUND: {
        messageKey: 'errors.codes.SNAPSHOT_NOT_FOUND.message',
        variant: 'snackbar',
    },
    PUSH_NO_CONFIGURADO: {
        messageKey: 'errors.codes.PUSH_NO_CONFIGURADO.message',
        variant: 'snackbar',
    },
});

export const STATUS_PRESENTATION = Object.freeze({
    0: {
        messageKey: 'errors.status.0.message',
        variant: 'dialog',
        titleKey: 'errors.status.0.title',
        tone: 'error',
    },
    400: { messageKey: 'errors.status.400.message', variant: 'snackbar' },
    401: {
        messageKey: 'errors.status.401.message',
        variant: 'dialog',
        titleKey: 'errors.status.401.title',
        tone: 'warning',
    },
    403: {
        messageKey: 'errors.status.403.message',
        variant: 'dialog',
        titleKey: 'errors.status.403.title',
        tone: 'warning',
    },
    404: { messageKey: 'errors.status.404.message', variant: 'snackbar' },
    409: { messageKey: 'errors.status.409.message', variant: 'snackbar' },
    422: { messageKey: 'errors.status.422.message', variant: 'snackbar' },
    429: {
        messageKey: 'errors.status.429.message',
        variant: 'snackbar',
    },
    500: {
        messageKey: 'errors.status.500.message',
        variant: 'dialog',
        titleKey: 'errors.status.500.title',
        tone: 'error',
    },
    503: {
        messageKey: 'errors.status.503.message',
        variant: 'dialog',
        titleKey: 'errors.status.503.title',
        tone: 'error',
    },
});

export const GENERIC_ERROR = Object.freeze({
    messageKey: 'errors.generic.message',
    variant: 'snackbar',
    icon: 'error',
    titleKey: 'errors.generic.title',
    tone: 'error',
});
