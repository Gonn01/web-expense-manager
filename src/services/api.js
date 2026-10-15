import axios from 'axios';
import { normalizeApiError, notifyError } from '@/services/error-handler';
import { useDialogStore } from '@/store/use-dialog-store';
import useAuth from '@/store/use-auth-store';
import { markSessionExpired } from '@/utils/session-expired';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Endpoints cuya UI muestra el error inline (formularios de login/registro):
// no dispares el snackbar/dialog global para ellos, pero igual normalizá el
// error para que el formulario lo pueda mostrar.
const SILENT_PATHS = ['/auth/login', '/auth/register'];

let sessionExpiredHandled = false;

/**
 * Manejo central de errores: TODA request que falle pasa por acá.
 *  - normaliza el error (code / status / message amigable)
 *  - lo muestra como snackbar o dialog según el catálogo (salvo endpoints silent)
 *  - en 401 cierra la sesión y manda al login, que muestra el cartel de sesión vencida
 * y re-lanza el error normalizado para que los `catch` locales sigan andando.
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const normalized = normalizeApiError(error);
        const url = error.config?.url ?? '';
        const silent = error.config?.meta?.silent || SILENT_PATHS.some((p) => url.startsWith(p));

        if (normalized.status === 401 && !silent) {
            if (!sessionExpiredHandled) {
                sessionExpiredHandled = true;
                useAuth.getState().logout();
                if (window.location.pathname.startsWith('/login')) {
                    useDialogStore.getState().alert({
                        title: normalized.title,
                        message: normalized.message,
                        tone: normalized.tone,
                    });
                } else {
                    // La recarga borra cualquier dialog: el aviso lo muestra
                    // la pantalla de login (cartel de sesión vencida).
                    markSessionExpired();
                    window.location.assign('/login');
                }
            }
            return Promise.reject(normalized);
        }

        if (!silent) notifyError(normalized);
        return Promise.reject(normalized);
    },
);

/* ===============================
   AUTH
=============================== */

export const register = async (userInfo) => {
    const { data } = await api.post('/auth/register', userInfo);
    return data.data;
};

export const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    return data.data;
};

export const loginWithFirebase = async (firebaseData) => {
    const { data } = await api.post('/auth/firebase-login', firebaseData);
    return data.data;
};

export const updatePreferredCurrency = async (userId, preferredCurrency, token) => {
    const { data } = await api.put(
        '/auth/preferred-currency',
        { user_id: userId, preferred_currency: preferredCurrency },
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data[0];
};

/* ===============================
   USUARIO
=============================== */

export const updateSueldo = async (sueldo, sueldoCurrency, token) => {
    const { data } = await api.put(
        '/user/sueldo',
        { sueldo, sueldo_currency: sueldoCurrency },
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

/* ===============================
   DASHBOARD (solo lectura)
=============================== */

export const fetchDashboardData = async (token) => {
    const { data } = await api.get('/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
};

/* ===============================
   ENTIDADES FINANCIERAS
=============================== */

export const fetchFinancialEntities = async (token) => {
    const { data } = await api.get('/entidades-financieras', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
};

export const fetchFinancialEntityById = async (entityId, token) => {
    const { data } = await api.get(`/entidades-financieras/${entityId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
};

export const createEntity = async (entityData, token) => {
    const { data } = await api.post('/entidades-financieras', entityData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
};

export const updateFinancialEntity = async (id, name, token) => {
    const { data } = await api.put(
        `/entidades-financieras/${id}`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

export const deleteFinancialEntity = async (id, token) => {
    await api.delete(`/entidades-financieras/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return true;
};

export const fetchDeletedEntities = async (token) => {
    const { data } = await api.get('/entidades-financieras/eliminadas', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
};

export const restoreEntity = async (id, token) => {
    const { data } = await api.put(
        `/entidades-financieras/${id}/restaurar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

export const vincularUsuarioEntidad = async (entityId, email, token) => {
    const { data } = await api.put(
        `/entidades-financieras/${entityId}/vincular-usuario`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

export const desvincularUsuarioEntidad = async (entityId, token) => {
    const { data } = await api.delete(`/entidades-financieras/${entityId}/vincular-usuario`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
};

/* ===============================
   GASTOS
=============================== */

export const createGasto = async (payload, token) => {
    const { data } = await api.post('/gastos', payload, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
};

export const fetchGastoById = async (gastoId, token) => {
    const { data } = await api.get(`/gastos/${gastoId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
};

export const updateGasto = async (gastoId, payload, token) => {
    const { data } = await api.put(`/gastos/${gastoId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
};

export const deleteGasto = async (gastoId, token, { deleteLinked = false } = {}) => {
    await api.delete(`/gastos/${gastoId}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { delete_linked: deleteLinked },
    });
    return true;
};

export const restaurarGasto = async (gastoId, token) => {
    const { data } = await api.post(
        `/gastos/${gastoId}/restaurar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

export const refundCuota = async (gastoId, token) => {
    const { data } = await api.post(
        `/gastos/${gastoId}/refund-cuota`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

export const settleQuota = async (gastoId, token, { direct = false } = {}) => {
    const { data } = await api.post(
        `/gastos/${gastoId}/settle-quota`,
        direct ? { direct: true } : {},
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

export const postergarGasto = async (gastoId, postponed, token) => {
    const { data } = await api.put(
        `/gastos/${gastoId}/postergar`,
        { postponed },
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

export const favoritoGasto = async (gastoId, favorite, token) => {
    const { data } = await api.put(
        `/gastos/${gastoId}/favorito`,
        { favorite },
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

export const favoritoEntidad = async (entidadId, favorite, token) => {
    const { data } = await api.put(
        `/entidades-financieras/${entidadId}/favorito`,
        { favorite },
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

/* ===============================
   CATEGORIAS
=============================== */

export const fetchCategories = async (token) => {
    const { data } = await api.get('/categorias', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
};

export const createCategory = async (payload, token) => {
    const { data } = await api.post('/categorias', payload, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
};

export const settleQuotasLote = async (ids, token) => {
    const { data } = await api.post(
        `/gastos/settle-lote`,
        { purchase_ids: ids },
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

/* ===============================
   MODO HACER CUENTAS (settlement)
=============================== */

export const fetchSettlementSession = async (token) => {
    const { data } = await api.get('/settlement/session', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.data; // { session, items } | null
};

export const startSettlementSession = async (token) => {
    const { data } = await api.post(
        '/settlement/session',
        {},
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data; // { session, items, alreadyOpen }
};

export const setSettlementItem = async ({ purchase_id, purchase_ids, checked }, token) => {
    const body = purchase_ids ? { purchase_ids, checked } : { purchase_id, checked };
    const { data } = await api.put('/settlement/session/items', body, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.data; // { session, items }
};

export const finishSettlementSession = async (token) => {
    const { data } = await api.post(
        '/settlement/session/finish',
        {},
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data; // snapshot
};

export const discardSettlementSession = async (token) => {
    const { data } = await api.delete('/settlement/session', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
};

export const fetchSettlementSnapshots = async (token) => {
    const { data } = await api.get('/settlement/snapshots', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
};

export const fetchSettlementSnapshotById = async (id, token) => {
    const { data } = await api.get(`/settlement/snapshots/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
};

/* ===============================
   COMPARTIDOS
=============================== */

export const fetchCompartidos = async (token) => {
    const { data } = await api.get('/compartidos', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.data; // { recibidos, emitidos, pagos: { porConfirmar, esperando } }
};

export const aprobarCompartido = async (gastoId, payload, token) => {
    const { data } = await api.post(`/compartidos/${gastoId}/aprobar`, payload, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
};

export const rechazarCompartido = async (gastoId, token) => {
    const { data } = await api.post(
        `/compartidos/${gastoId}/rechazar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

export const reintentarCompartido = async (gastoId, token) => {
    const { data } = await api.post(
        `/compartidos/${gastoId}/reintentar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

/* ===============================
   PAGOS COMPARTIDOS (confirmación entre usuarios)
   La lectura viaja dentro de fetchCompartidos() -> data.pagos
=============================== */

export const confirmarPago = async (movementId, token) => {
    const { data } = await api.post(
        `/compartidos/pagos/${movementId}/confirmar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

export const rechazarPago = async (movementId, token) => {
    const { data } = await api.post(
        `/compartidos/pagos/${movementId}/rechazar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};
