import { t } from '@/i18n';

const CONFIG = {
    PENDING_APPROVAL: {
        label: t('common.pending'),
        className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    REJECTED: {
        label: t('common.rejected'),
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    },
    ACTIVE: {
        label: t('common.approved'),
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    },
};

export default function StatusBadge({ status }) {
    const cfg = CONFIG[status] ?? { label: status, className: 'bg-zinc-100 text-zinc-600' };
    return (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.className}`}>
            {cfg.label}
        </span>
    );
}
