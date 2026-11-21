import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/Icon';
import ModalOverlay from './components/ModalOverlay';
import ModalContainer from './components/ModalContainer';
import ModalHeader from './components/ModalHeader';
import SinglePaymentSection from './components/SinglePaymentSection';
import MultiPaymentSection from './components/MultiPaymentSection';
import ModalActions from './components/ModalActions';
import { t } from '@/i18n';
import { Trans } from 'react-i18next';

export default function ConfirmInstallmentPaymentModal({
    open,
    onCancel,
    onConfirm,
    entityName,
    items = [],
    loading = false,
    settlementActive = true,
    showSettlementWarning = true,
}) {
    const [removedIds, setRemovedIds] = useState(() => new Set());

    useEffect(() => {
        if (!open) return;

        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const onKey = (e) => e.key === 'Escape' && onCancel?.();
        document.addEventListener('keydown', onKey);

        return () => {
            document.body.style.overflow = prev;
            document.removeEventListener('keydown', onKey);
        };
    }, [open, onCancel]);

    const itemsKey = items.map((it) => it.id).join(',');
    useEffect(() => {
        setRemovedIds(new Set());
    }, [open, itemsKey]);

    const activeItems = useMemo(
        () => items.filter((it) => !removedIds.has(it.id)),
        [items, removedIds],
    );
    const removedItems = useMemo(
        () => items.filter((it) => removedIds.has(it.id)),
        [items, removedIds],
    );

    if (!open) return null;

    const isSingle = items.length === 1;
    const single = isSingle ? items[0] : null;

    const removeItem = (id) =>
        setRemovedIds((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
        });

    const restoreItem = (id) =>
        setRemovedIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });

    const handleConfirm = () => {
        if (!activeItems.length) return;
        onConfirm?.(activeItems);
    };

    const verbo = settlementActive ? t('payment.verbMark') : t('payment.verbRecord');
    const registraMsg = settlementActive
        ? t('modals.itSRecordedWhenYouFinishThe')
        : t('modals.itSRecordedNowInThisExpense');

    return createPortal(
        <ModalOverlay onClose={onCancel}>
            <ModalContainer>
                <ModalHeader
                    icon="payments"
                    title={
                        settlementActive
                            ? isSingle
                                ? t('modals.markInstallmentPayment')
                                : t('modals.markInstallmentPayments')
                            : isSingle
                              ? t('modals.recordInstallmentPayment')
                              : t('modals.recordInstallmentPayments')
                    }
                    description={
                        isSingle
                            ? t('payment.singleDescription', {
                                  verb: verbo,
                                  name: single.name,
                                  entity: entityName,
                                  detail: registraMsg,
                              })
                            : t('payment.multiDescription', {
                                  count: activeItems.length,
                                  verb: verbo,
                                  entity: entityName,
                                  detail: registraMsg,
                              })
                    }
                />

                {!settlementActive && showSettlementWarning && (
                    <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-left text-xs text-amber-300">
                        <Icon name="warning" className="text-base shrink-0 mt-px" />
                        <span>
                            <Trans
                                i18nKey="payment.noSessionWarning"
                                components={{ strong: <strong /> }}
                            />
                        </span>
                    </div>
                )}

                {isSingle && single?.is_postponed && (
                    <div className="mb-3 flex items-start gap-2 rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-left text-xs text-sky-300">
                        <Icon name="schedule" className="text-base shrink-0 mt-px" />
                        <span>{t('modals.thisExpenseIsPostponedPayingItRemoves')}</span>
                    </div>
                )}

                {isSingle ? (
                    <SinglePaymentSection item={single} entityName={entityName} />
                ) : (
                    <MultiPaymentSection
                        items={activeItems}
                        removedItems={removedItems}
                        entityName={entityName}
                        onRemove={removeItem}
                        onRestore={restoreItem}
                    />
                )}

                <ModalActions
                    onCancel={onCancel}
                    onConfirm={handleConfirm}
                    loading={loading}
                    disabled={!activeItems.length}
                />
            </ModalContainer>
        </ModalOverlay>,
        document.body,
    );
}
