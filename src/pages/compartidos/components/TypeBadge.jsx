const COLOR_CLASSES = {
    gasto: 'bg-primary/15 text-primary',
    pago: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
};

export default function TypeBadge({ type }) {
    const label = type === 'pago' ? 'Pago' : 'Gasto';

    return (
        <span
            className={`shrink-0 inline-flex items-center rounded-full text-[11px] font-bold px-2 py-0.5 ${COLOR_CLASSES[type]}`}
        >
            {label}
        </span>
    );
}
