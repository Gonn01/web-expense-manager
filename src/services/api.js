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

const SILENT_PATHS = ['/auth/login', '/auth/register', '/auth/firebase-login'];

let sessionExpiredHandled = false;

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

export const updatePreferredCurrency = async (preferredCurrency, token) => {
    const { data } = await api.put(
        '/user/preferred-currency',
        { preferred_currency: preferredCurrency },
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

export const updateSueldo = async (sueldo, sueldoCurrency, token) => {
    const { data } = await api.put(
        '/user/sueldo',
        { sueldo, sueldo_currency: sueldoCurrency },
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

export const fetchPasswordStatus = async (token) => {
    const { data } = await api.get('/user/password-status', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
};

export const updatePassword = async ({ currentPassword, newPassword }, token) => {
    const { data } = await api.put(
        '/user/password',
        { current_password: currentPassword, new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

export const revokeAllSessions = async (token) => {
    const { data } = await api.post(
        '/user/sessions/revoke',
        {},
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

export const authorizeRealtimeChannel = async (socketId, channelName, token) => {
    const { data } = await api.post(
        '/user/realtime-auth',
        { socket_id: socketId, channel_name: channelName },
        { headers: { Authorization: `Bearer ${token}` }, meta: { silent: true } },
    );
    return data.data;
};

export const fetchDashboardData = async (token) => {
    const { data } = await api.get('/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
};

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

export const updateEntityMercadoPagoAlias = async (id, alias, token) => {
    const { data } = await api.put(
        `/entidades-financieras/${id}/alias-mercado-pago`,
        { alias },
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

export const deleteFinancialEntity = async (id, token) => {
    const { data } = await api.delete(`/entidades-financieras/${id}`, {
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

export const compartirGasto = async (gastoId, token) => {
    const { data } = await api.post(
        `/gastos/${gastoId}/compartir`,
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

export const fetchSettlementSession = async (token) => {
    const { data } = await api.get('/settlement/session', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
};

export const startSettlementSession = async (token) => {
    const { data } = await api.post(
        '/settlement/session',
        {},
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

export const setSettlementItem = async ({ purchase_id, purchase_ids, checked }, token) => {
    const body = purchase_ids ? { purchase_ids, checked } : { purchase_id, checked };
    const { data } = await api.put('/settlement/session/items', body, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
};

export const finishSettlementSession = async (token) => {
    const { data } = await api.post(
        '/settlement/session/finish',
        {},
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
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

export const fetchCompartidos = async (token) => {
    const { data } = await api.get('/notificaciones/pendientes', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
};

export const fetchNotificaciones = async ({ before } = {}, token) => {
    const { data } = await api.get('/notificaciones', {
        params: before ? { before } : undefined,
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
};

export const marcarNotificacionLeida = async (id, token) => {
    const { data } = await api.post(
        `/notificaciones/${id}/leer`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

export const marcarNotificacionesLeidas = async (token) => {
    const { data } = await api.post(
        '/notificaciones/leer-todas',
        {},
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

export const aprobarCompartido = async (gastoId, payload, token) => {
    const { data } = await api.post(`/notificaciones/pendientes/${gastoId}/aprobar`, payload, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
};

export const rechazarCompartido = async (gastoId, token) => {
    const { data } = await api.post(
        `/notificaciones/pendientes/${gastoId}/rechazar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

export const reintentarCompartido = async (gastoId, token) => {
    const { data } = await api.post(
        `/notificaciones/pendientes/${gastoId}/reintentar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

export const descartarCompartido = async (gastoId, deleteLinked, token) => {
    const { data } = await api.post(
        `/notificaciones/pendientes/${gastoId}/descartar`,
        { delete_linked: deleteLinked },
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

export const confirmarPago = async (movementId, token) => {
    const { data } = await api.post(
        `/notificaciones/pendientes/pagos/${movementId}/confirmar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

export const rechazarPago = async (movementId, token) => {
    const { data } = await api.post(
        `/notificaciones/pendientes/pagos/${movementId}/rechazar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

export const retirarPago = async (movementId, token) => {
    const { data } = await api.post(
        `/notificaciones/pendientes/pagos/${movementId}/retirar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

export const aceptarReversion = async (movementId, token) => {
    const { data } = await api.post(
        `/notificaciones/pendientes/pagos/${movementId}/reversion/aceptar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

export const rechazarReversion = async (movementId, token) => {
    const { data } = await api.post(
        `/notificaciones/pendientes/pagos/${movementId}/reversion/rechazar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

const postEdicion = async (url, body, token) => {
    const { data } = await api.post(url, body, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
};

export const solicitarEdicionCompartida = (gastoId, changes, token) =>
    postEdicion(`/notificaciones/pendientes/gastos/${gastoId}/edicion`, changes, token);

export const aprobarEdicionCompartida = (editId, token) =>
    postEdicion(`/notificaciones/pendientes/ediciones/${editId}/aprobar`, {}, token);

export const rechazarEdicionCompartida = (editId, token) =>
    postEdicion(`/notificaciones/pendientes/ediciones/${editId}/rechazar`, {}, token);

export const cancelarEdicionCompartida = (editId, token) =>
    postEdicion(`/notificaciones/pendientes/ediciones/${editId}/cancelar`, {}, token);

export const cancelarReversion = async (movementId, token) => {
    const { data } = await api.post(
        `/notificaciones/pendientes/pagos/${movementId}/reversion/cancelar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};

export const revertirPago = async (gastoId, movementId, token) => {
    const { data } = await api.post(
        `/gastos/${gastoId}/pagos/${movementId}/revertir`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
};
