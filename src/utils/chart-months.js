export function currentMonthIndex() {
    const today = new Date();
    return today.getFullYear() * 12 + today.getMonth();
}

export function monthIndexFromDateString(dateStr) {
    const match = /^(\d{4})-(\d{2})/.exec(String(dateStr));
    if (!match) {
        const d = new Date(dateStr);
        return d.getFullYear() * 12 + d.getMonth();
    }
    return Number(match[1]) * 12 + (Number(match[2]) - 1);
}

export function keyFromMonthIndex(idx) {
    const year = Math.floor(idx / 12);
    const month = idx % 12;
    return `${year}-${String(month + 1).padStart(2, '0')}`;
}

export function labelFromKey(key) {
    const [year, month] = key.split('-');
    return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('es-AR', {
        month: 'short',
        year: 'numeric',
    });
}

export function labelFromMonthIndex(idx) {
    return new Date(Math.floor(idx / 12), idx % 12, 1).toLocaleDateString('es-AR', {
        month: 'long',
        year: 'numeric',
    });
}

export function pendingQuotaMonths(gasto, currentMonth = currentMonthIndex()) {
    const total = Number(gasto.number_of_quotas || 0);
    const paid = Number(gasto.payed_quotas || 0);
    const remaining = total - paid;
    if (gasto.fixed_expense || remaining <= 0 || total === 0) return null;

    let start = currentMonth;
    if (gasto.first_quota_date) {
        start = Math.max(monthIndexFromDateString(gasto.first_quota_date) + paid, currentMonth);
    }
    return { start, end: start + remaining - 1 };
}
