import Icon from '@/components/Icon';

const STATUS = {
    pendiente: {
        label: 'Pendiente',
        icon: 'hourglass_empty',
        className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
        title: 'Falta que la otra persona confirme el pago',
    },
    aprobado: {
        label: 'Aprobado',
        icon: 'check_circle',
        className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
        title: 'La otra persona confirmó el pago',
    },
    rechazado: {
        label: 'Rechazado',
        icon: 'cancel',
        className: 'bg-red-500/15 text-red-600 dark:text-red-400',
        title: 'La otra persona rechazó el pago: la cuota sigue sin pagar',
    },
    retirado: {
        label: 'Retirado',
        icon: 'remove_circle',
        className: 'bg-slate-500/15 text-slate-600 dark:text-slate-300',
        title: 'Retiraste el pago antes de que lo confirmaran',
    },
    reversion_pendiente: {
        label: 'Reversión pendiente',
        icon: 'undo',
        className: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
        title: 'Hay un pedido de reversión de este pago esperando respuesta',
    },
    revertido: {
        label: 'Revertido',
        icon: 'undo',
        className: 'bg-slate-500/15 text-slate-600 dark:text-slate-300',
        title: 'El pago se revirtió después de cerrar las cuentas',
    },
};

export default function PaymentStatusBadge({ status }) {
    const config = STATUS[status];
    if (!config) return null;

    return (
        <span
            title={config.title}
            className={`inline-flex items-center gap-1 rounded-full text-[11px] font-bold px-2 py-0.5 whitespace-nowrap ${config.className}`}
        >
            <Icon name={config.icon} className="text-xs" />
            {config.label}
        </span>
    );
}
