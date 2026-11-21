import { useState } from 'react';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import { t } from '@/i18n';

function MirrorOption({ name, checked, onChange, title, hint }) {
    return (
        <label className="flex items-start gap-2 cursor-pointer select-none rounded-lg border border-slate-200 dark:border-[#29382f] p-3">
            <input
                type="radio"
                name="mirror-choice"
                checked={checked}
                onChange={onChange}
                className="mt-0.5"
            />
            <span className="min-w-0">
                <span className="block font-semibold text-slate-900 dark:text-white">
                    {title} {name}
                </span>
                <span className="block text-xs text-slate-500 dark:text-[#9eb7a8]">{hint}</span>
            </span>
        </label>
    );
}

export default function DescartarModal({ item, loading, onClose, onConfirm }) {
    const [deleteLinked, setDeleteLinked] = useState(null);
    const hasMirror = item.mirror_id != null;
    const mirrorName = item.mirror_entity_name ?? t('people.theOtherEntity');
    const paidQuotas = Number(item.mirror_payed_quotas) || 0;

    const message = hasMirror ? (
        <span className="flex flex-col gap-2">
            <span className="block">{t('shared.mirrorQuestion', { entity: mirrorName })}</span>
            <MirrorOption
                name={t('shared.inEntity', { entity: mirrorName })}
                title={t('compartidos.keepIt')}
                hint={t('compartidos.thePaymentHappenedItStaysAsA')}
                checked={deleteLinked === false}
                onChange={() => setDeleteLinked(false)}
            />
            <MirrorOption
                name={t('shared.inEntity', { entity: mirrorName })}
                title={t('compartidos.deleteIt')}
                hint={
                    paidQuotas > 0
                        ? t('shared.mirrorPaid', { count: paidQuotas })
                        : t('compartidos.theExpenseWasAMistakeItStops')
                }
                checked={deleteLinked === true}
                onChange={() => setDeleteLinked(true)}
            />
        </span>
    ) : (
        t('shared.discardMessage', {
            name: item.name,
            receiver: item.receiver_name ?? t('people.otherPerson'),
        })
    );

    return (
        <ConfirmDeleteModal
            open
            title={t('compartidos.discardExpense')}
            message={message}
            confirmLabel={t('common.discard')}
            loading={loading}
            confirmDisabled={hasMirror && deleteLinked === null}
            onCancel={onClose}
            onConfirm={() => onConfirm(hasMirror ? deleteLinked : undefined)}
        />
    );
}
