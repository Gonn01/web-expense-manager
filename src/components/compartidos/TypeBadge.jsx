import { t } from '@/i18n';

const BADGES = {
    gasto: { label: t('compartidos.expense'), className: 'bg-primary/15 text-primary' },
    pago: {
        label: t('common.payment'),
        className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    },
    reversion: {
        label: t('common.reversal'),
        className: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    },
    edicion: {
        label: t('common.edit'),
        className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    },
};

export default function TypeBadge({ type }) {
    const badge = BADGES[type] ?? BADGES.gasto;

    return (
        <span
            className={`shrink-0 inline-flex items-center rounded-full text-[11px] font-bold px-2 py-0.5 ${badge.className}`}
        >
            {badge.label}
        </span>
    );
}
