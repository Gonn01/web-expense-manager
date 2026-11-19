export function isInvertedRange(from, to) {
    return Boolean(from && to && from > to);
}

export function orderedRange(from, to) {
    return isInvertedRange(from, to) ? { from: to, to: from } : { from, to };
}

export function inDateRange(date, from, to) {
    const t = new Date(date).getTime();
    if (Number.isNaN(t)) return false;
    const range = orderedRange(from, to);
    if (range.from && t < new Date(`${range.from}T00:00:00`).getTime()) return false;
    if (range.to && t > new Date(`${range.to}T23:59:59.999`).getTime()) return false;
    return true;
}
