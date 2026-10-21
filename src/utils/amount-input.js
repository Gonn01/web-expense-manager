export function parseAmountInput(raw) {
    let cleaned = raw.replace(/\./g, '').replace(',', '.');
    cleaned = cleaned.replace(/[^0-9.]/g, '');

    const firstDot = cleaned.indexOf('.');
    if (firstDot !== -1) {
        cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
    }

    return cleaned;
}

export function formatAmountInput(value) {
    if (value === '' || value === null || value === undefined) return '';

    const [intPart, decPart] = String(value).split('.');
    const formattedInt = intPart.replace(/^0+(?=\d)/, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return decPart !== undefined ? `${formattedInt},${decPart}` : formattedInt;
}

const SIGNIFICANT_CHAR = /[\d,]/;

export function countSignificantChars(text, upTo) {
    let count = 0;
    for (let i = 0; i < upTo; i++) {
        if (SIGNIFICANT_CHAR.test(text[i])) count++;
    }
    return count;
}

export function caretAfterSignificantChars(text, count) {
    if (count === 0) return 0;
    let seen = 0;
    for (let i = 0; i < text.length; i++) {
        if (SIGNIFICANT_CHAR.test(text[i])) seen++;
        if (seen === count) return i + 1;
    }
    return text.length;
}
