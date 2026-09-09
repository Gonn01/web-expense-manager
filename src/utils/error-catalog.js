/**
 * Catálogo de errores del front. Espeja los `code` que devuelve la API
 * (ver api-plataformas-desarrollo/utils/errors.js) y define, para cada uno,
 * cómo mostrarlo al usuario:
 *
 *   - message: texto amigable. Si se omite, se usa el `error` que mandó el
 *     backend y, si tampoco hay, el fallback por status.
 *   - variant: 'snackbar' (transitorio) | 'dialog' (requiere acknowledge).
 *   - icon: material symbol para el snackbar.
 *   - title: título del dialog (solo si variant === 'dialog').
 *   - tone: 'error' | 'warning' | 'info' (color del dialog).
 *
 * Para cambiar cómo se ve un error puntual, editá su entrada acá. Nada más.
 */

export const ERROR_PRESENTATION = Object.freeze({
    // ─── Validación de input ────────────────────────────────────────────────
    VALIDATION_ERROR: { variant: 'snackbar', icon: 'error' },

    // ─── Gastos ─────────────────────────────────────────────────────────────
    GASTO_NOT_FOUND: { message: 'No encontramos ese gasto.', variant: 'snackbar' },
    GASTO_POSTERGADO: {
        message: 'Ese gasto está postergado para la próxima sesión de cuentas.',
        variant: 'snackbar',
        icon: 'schedule',
    },
    GASTO_NO_PENDIENTE_APROBACION: {
        message: 'El gasto ya no está pendiente de aprobación.',
        variant: 'snackbar',
    },
    GASTO_COMPARTIDO_NO_ASOCIADO: {
        message: 'No hay un gasto compartido asociado.',
        variant: 'snackbar',
    },
    GASTO_COMPARTIDO_NO_RECHAZADO: {
        message: 'Ese gasto compartido no está rechazado.',
        variant: 'snackbar',
    },
    SIN_CUOTAS_PARA_REVERTIR: {
        message: 'No hay cuotas pagadas para revertir.',
        variant: 'snackbar',
    },
    LISTA_IDS_INVALIDA: { message: 'La selección de gastos no es válida.', variant: 'snackbar' },

    // ─── Entidades financieras ──────────────────────────────────────────────
    ENTIDAD_NOT_FOUND: { message: 'No encontramos esa entidad.', variant: 'snackbar' },
    ENTIDAD_FINANCIERA_NOT_FOUND: {
        message: 'La entidad financiera no existe o fue eliminada.',
        variant: 'snackbar',
    },
    ENTIDAD_PAGO_NOT_FOUND: {
        message: 'La entidad de pago no existe o fue eliminada.',
        variant: 'snackbar',
    },
    ENTIDAD_NOT_FOUND_O_AJENA: {
        message: 'Esa entidad no existe o no te pertenece.',
        variant: 'snackbar',
    },
    ENTIDAD_YA_EXISTE: { message: 'Ya tenés una entidad con ese nombre.', variant: 'snackbar' },
    ENTIDAD_O_NOMBRE_REQUERIDO: {
        message: 'Elegí una entidad o escribí un nombre para crear una nueva.',
        variant: 'snackbar',
    },
    VINCULAR_CUENTA_PROPIA: {
        message: 'No podés vincular tu propia cuenta.',
        variant: 'snackbar',
    },
    ENTIDAD_YA_VINCULADA: { variant: 'snackbar' }, // el backend manda el nombre en el texto

    // ─── Usuarios / auth ────────────────────────────────────────────────────
    USUARIO_NOT_FOUND: { message: 'No encontramos tu usuario.', variant: 'snackbar' },
    USUARIO_EMAIL_NOT_FOUND: {
        message: 'No hay ningún usuario registrado con ese email.',
        variant: 'snackbar',
    },
    CREDENCIALES_INVALIDAS: { message: 'Email o contraseña incorrectos.', variant: 'snackbar' },
    EMAIL_YA_REGISTRADO: { message: 'Ya existe una cuenta con ese email.', variant: 'snackbar' },

    // ─── Compartidos ────────────────────────────────────────────────────────
    NO_AUTORIZADO: {
        message: 'No tenés permiso para hacer esto.',
        variant: 'dialog',
        title: 'Acción no permitida',
        tone: 'warning',
    },
    PAGO_PENDIENTE_NOT_FOUND: {
        message: 'Ese pago pendiente ya no existe.',
        variant: 'snackbar',
    },

    // ─── Categorías ─────────────────────────────────────────────────────────
    CATEGORIA_NOT_FOUND: { message: 'No encontramos esa categoría.', variant: 'snackbar' },

    // ─── Modo "hacer cuentas" (reconcile) ───────────────────────────────────
    RECONCILE_REQUIRED: {
        message: 'Necesitás una sesión de "Hacer cuentas" abierta para esto.',
        variant: 'snackbar',
        icon: 'playlist_add_check',
    },
    NO_OPEN_SESSION: {
        message: 'No tenés una sesión de cuentas abierta.',
        variant: 'snackbar',
    },
    SNAPSHOT_NOT_FOUND: { message: 'No encontramos esa sesión de cuentas.', variant: 'snackbar' },
});

/**
 * Fallback por status HTTP cuando el error no trae un `code` conocido
 * (errores de red, 500 sin body, servicios de terceros, etc.).
 */
export const STATUS_PRESENTATION = Object.freeze({
    0: {
        message: 'No pudimos conectarnos. Revisá tu conexión a internet.',
        variant: 'dialog',
        title: 'Sin conexión',
        tone: 'error',
    },
    400: { message: 'Revisá los datos e intentá de nuevo.', variant: 'snackbar' },
    401: {
        message: 'Tu sesión expiró. Volvé a iniciar sesión.',
        variant: 'dialog',
        title: 'Sesión expirada',
        tone: 'warning',
    },
    403: {
        message: 'No tenés permiso para hacer esto.',
        variant: 'dialog',
        title: 'Acción no permitida',
        tone: 'warning',
    },
    404: { message: 'No encontramos lo que buscabas.', variant: 'snackbar' },
    409: { message: 'La operación no se pudo completar por un conflicto.', variant: 'snackbar' },
    422: { message: 'Revisá los datos e intentá de nuevo.', variant: 'snackbar' },
    429: {
        message: 'Estás yendo muy rápido. Esperá unos segundos e intentá de nuevo.',
        variant: 'snackbar',
    },
    500: {
        message: 'Tuvimos un problema procesando tu pedido. Probá de nuevo en un momento.',
        variant: 'dialog',
        title: 'Error del servidor',
        tone: 'error',
    },
    503: {
        message: 'El servicio no está disponible en este momento. Probá más tarde.',
        variant: 'dialog',
        title: 'Servicio no disponible',
        tone: 'error',
    },
});

export const GENERIC_ERROR = Object.freeze({
    message: 'Ocurrió un error inesperado. Probá de nuevo.',
    variant: 'snackbar',
    icon: 'error',
    title: 'Error',
    tone: 'error',
});
