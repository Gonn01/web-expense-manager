import { getIntlLocale } from '@/i18n';

export function formatDate(dateString) {
    const d = new Date(dateString);
    return d.toLocaleDateString(getIntlLocale(), {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

export function formatDateShort(dateString) {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString(getIntlLocale(), {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

export function formatDateTime(dateString) {
    if (!dateString) return null;
    const d = new Date(dateString);
    const date = d.toLocaleDateString(getIntlLocale(), {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
    const time = d.toLocaleTimeString(getIntlLocale(), {
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    });
    return `${date} ${time}`;
}
