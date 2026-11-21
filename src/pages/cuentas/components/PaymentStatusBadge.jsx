import Icon from '@/components/Icon';
import { t } from '@/i18n';

const STATUS = {
    pendiente: {
        label: t('common.pending'),
        icon: 'hourglass_empty',
        className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
        title: t('cuentas.theOtherPersonStillHasToConfirm'),
    },
    aprobado: {
        label: t('common.approved'),
        icon: 'check_circle',
        className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
        title: t('cuentas.theOtherPersonConfirmedThePayment'),
    },
    rechazado: {
        label: t('common.rejected'),
        icon: 'cancel',
        className: 'bg-red-500/15 text-red-600 dark:text-red-400',
        title: t('cuentas.theOtherPersonRejectedThePaymentThe'),
    },
    retirado: {
        label: t('common.withdrawn'),
        icon: 'remove_circle',
        className: 'bg-slate-500/15 text-slate-600 dark:text-slate-300',
        title: t('cuentas.youWithdrewThePaymentBeforeItWas'),
    },
    reversion_pendiente: {
        label: t('common.reversalPending'),
        icon: 'undo',
        className: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
        title: t('cuentas.aReversalRequestForThisPaymentIs'),
    },
    revertido: {
        label: t('cuentas.reverted'),
        icon: 'undo',
        className: 'bg-slate-500/15 text-slate-600 dark:text-slate-300',
        title: t('cuentas.thePaymentWasRevertedAfterTheSettlement'),
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
