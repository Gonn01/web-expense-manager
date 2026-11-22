import { ExpenseStatus } from './enums';
import { countGastosPorResolver } from './compartidos-pending';

export const CompartidoAction = Object.freeze({
    APROBAR: 'aprobar',
    RECHAZAR: 'rechazar',
    REINTENTAR: 'reintentar',
    DESCARTAR: 'descartar',
    CONFIRMAR_PAGO: 'confirmarPago',
    RECHAZAR_PAGO: 'rechazarPago',
    RETIRAR_PAGO: 'retirarPago',
    ACEPTAR_REVERSION: 'aceptarReversion',
    RECHAZAR_REVERSION: 'rechazarReversion',
    CANCELAR_REVERSION: 'cancelarReversion',
    APROBAR_EDICION: 'aprobarEdicion',
    RECHAZAR_EDICION: 'rechazarEdicion',
    CANCELAR_EDICION: 'cancelarEdicion',
});

const withoutId = (list = [], id, key = 'id') => list.filter((it) => it[key] !== id);

const updateList = (state, group, side, list) => ({
    ...state,
    [group]: { ...state[group], [side]: list },
});

export function applyCompartidoAction(state, kind, id) {
    const { compartidos, pagos, reversiones, ediciones } = state;
    switch (kind) {
        case CompartidoAction.APROBAR:
            return updateList(
                state,
                'compartidos',
                'recibidos',
                withoutId(compartidos.recibidos, id),
            );
        case CompartidoAction.RECHAZAR:
            return updateList(
                state,
                'compartidos',
                'recibidos',
                compartidos.recibidos.map((r) =>
                    r.id === id ? { ...r, status: ExpenseStatus.REJECTED } : r,
                ),
            );
        case CompartidoAction.REINTENTAR:
            return updateList(
                state,
                'compartidos',
                'emitidos',
                compartidos.emitidos.map((e) =>
                    e.id === id ? { ...e, copy_status: ExpenseStatus.PENDING_APPROVAL } : e,
                ),
            );
        case CompartidoAction.DESCARTAR:
            return updateList(
                state,
                'compartidos',
                'emitidos',
                withoutId(compartidos.emitidos, id),
            );
        case CompartidoAction.CONFIRMAR_PAGO:
        case CompartidoAction.RECHAZAR_PAGO:
            return updateList(
                state,
                'pagos',
                'porConfirmar',
                withoutId(pagos.porConfirmar, id, 'movement_id'),
            );
        case CompartidoAction.RETIRAR_PAGO:
            return updateList(
                state,
                'pagos',
                'esperando',
                withoutId(pagos.esperando, id, 'movement_id'),
            );
        case CompartidoAction.ACEPTAR_REVERSION:
        case CompartidoAction.RECHAZAR_REVERSION:
            return updateList(
                state,
                'reversiones',
                'porConfirmar',
                withoutId(reversiones.porConfirmar, id, 'movement_id'),
            );
        case CompartidoAction.CANCELAR_REVERSION:
            return updateList(
                state,
                'reversiones',
                'esperando',
                withoutId(reversiones.esperando, id, 'movement_id'),
            );
        case CompartidoAction.APROBAR_EDICION:
        case CompartidoAction.RECHAZAR_EDICION:
            return updateList(
                state,
                'ediciones',
                'porConfirmar',
                withoutId(ediciones.porConfirmar, id),
            );
        case CompartidoAction.CANCELAR_EDICION:
            return updateList(state, 'ediciones', 'esperando', withoutId(ediciones.esperando, id));
        default:
            return state;
    }
}

export function compartidosCounters({ compartidos, pagos, reversiones, ediciones }) {
    return {
        gastos: countGastosPorResolver(compartidos),
        pagos:
            (pagos.porConfirmar?.length ?? 0) +
            (reversiones.porConfirmar?.length ?? 0) +
            (ediciones.porConfirmar?.length ?? 0),
    };
}
