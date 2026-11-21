export function deleteExpenseNotice(gasto) {
    if (!gasto?.was_shared) return { key: 'detalleGasto.deleteRestorableHint' };
    const name = gasto.shared_partner_name;
    if (!name) return { key: 'detalleGasto.deleteFormerlySharedWarning' };
    return {
        key:
            gasto.status === 'ACTIVE'
                ? 'detalleGasto.deleteSharedWarning'
                : 'detalleGasto.deleteUnacceptedWarning',
        params: { name },
    };
}
