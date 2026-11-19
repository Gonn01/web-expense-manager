import Icon from '@/components/Icon';
import { TONES } from '@/utils/movement-styles';
import { pendingApprovalLabel } from '../utils/pending-approval-text';

export default function PendingApprovalNotice({ count }) {
    const plural = count !== 1;
    return (
        <div
            className={`mx-2 my-2 flex items-start gap-3 rounded-lg border-l-4 ${TONES.warning.border} bg-amber-50 dark:bg-amber-500/10 px-3 py-2.5`}
        >
            <span
                className={`shrink-0 flex items-center justify-center size-8 rounded-full ${TONES.warning.badge}`}
            >
                <Icon name="hourglass_top" className="text-lg" />
            </span>
            <div className="min-w-0">
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                    {pendingApprovalLabel(count)}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                    {plural
                        ? 'La otra persona todavía no los aceptó. Se suman a los balances cuando los acepte.'
                        : 'La otra persona todavía no lo aceptó. Se suma a los balances cuando lo acepte.'}
                </p>
            </div>
        </div>
    );
}
