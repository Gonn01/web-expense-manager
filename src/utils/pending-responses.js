const sameId = (a, b) => a != null && b != null && String(a) === String(b);

const EMPTY_RESPONSES = { recibidos: [], pagos: [], reversiones: [], ediciones: [] };

const isPendingReceived = (item) => item.status === 'PENDING_APPROVAL';

export function pendingResponsesForGasto(shared, gasto) {
    if (!gasto) return EMPTY_RESPONSES;
    const payments = (gasto.movements ?? []).filter((m) => m.movement_type === 'PAYMENT');
    return {
        recibidos: (shared.compartidos?.recibidos ?? []).filter(
            (item) => isPendingReceived(item) && sameId(item.id, gasto.id),
        ),
        pagos: (shared.pagos?.porConfirmar ?? []).filter((pago) =>
            sameId(pago.sibling_purchase_id, gasto.id),
        ),
        reversiones: (shared.reversiones?.porConfirmar ?? []).filter((reversion) =>
            payments.some(
                (m) =>
                    sameId(m.id, reversion.movement_id) ||
                    sameId(m.paired_movement_id, reversion.movement_id),
            ),
        ),
        ediciones: (shared.ediciones?.porConfirmar ?? []).filter((edicion) =>
            sameId(edicion.id, gasto.pending_edit_request?.id),
        ),
    };
}

export function pendingResponsesForEntity(shared, entity) {
    if (!entity?.linked_user_id) return EMPTY_RESPONSES;
    return {
        ...EMPTY_RESPONSES,
        recibidos: (shared.compartidos?.recibidos ?? []).filter(
            (item) => isPendingReceived(item) && sameId(item.sender_id, entity.linked_user_id),
        ),
    };
}

export function countPendingResponses({ recibidos, pagos, reversiones, ediciones }) {
    return recibidos.length + pagos.length + reversiones.length + ediciones.length;
}
