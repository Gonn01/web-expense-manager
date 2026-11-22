import { ExpenseStatus } from './enums';

export function countGastosPorResolver({ recibidos = [], emitidos = [] }) {
    const recibidosPendientes = recibidos.filter(
        (r) => r.status === ExpenseStatus.PENDING_APPROVAL,
    ).length;
    const emitidosRechazados = emitidos.filter(
        (e) => e.copy_status === ExpenseStatus.REJECTED,
    ).length;
    return recibidosPendientes + emitidosRechazados;
}

export function countPagosByPurchase(pagos = []) {
    const counts = new Map();
    pagos.forEach((p) => counts.set(p.purchase_id, (counts.get(p.purchase_id) ?? 0) + 1));
    return counts;
}
