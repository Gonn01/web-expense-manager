import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/Icon';
import ModalOverlay from './components/ModalOverlay';
import ModalContainer from './components/ModalContainer';
import ModalHeader from './components/ModalHeader';
import SinglePaymentSection from './components/SinglePaymentSection';
import MultiPaymentSection from './components/MultiPaymentSection';
import ModalActions from './components/ModalActions';

export default function ConfirmInstallmentPaymentModal({
    open,
    onCancel,
    onConfirm,
    entityName,
    items = [],
    loading = false,
    reconcileActive = true,
    // Aviso "esto no queda en el historial de cuentas". Tiene sentido en la
    // pantalla de detalle de gasto; en el resto no hablamos de "hacer cuentas".
    showReconcileWarning = true,
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

    // Reinicia la lista de excluidos cada vez que se abre el modal o cambian los items.
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

    const verbo = reconcileActive ? 'marcar' : 'registrar';
    const registraMsg = reconcileActive
        ? 'Se registra al terminar las cuentas.'
        : 'Se registra ahora en el historial de este gasto.';

    return createPortal(
        <ModalOverlay onClose={onCancel}>
            <ModalContainer>
                <ModalHeader
                    icon="payments"
                    title={
                        reconcileActive
                            ? isSingle
                                ? 'Marcar Pago de Cuota'
                                : 'Marcar Pago de Cuotas'
                            : isSingle
                              ? 'Registrar Pago de Cuota'
                              : 'Registrar Pago de Cuotas'
                    }
                    description={
                        isSingle
                            ? `Vas a ${verbo} el pago de ${single.name} en ${entityName}. ${registraMsg}`
                            : `Vas a ${verbo} el pago de ${activeItems.length} gasto${
                                  activeItems.length === 1 ? '' : 's'
                              } activo${activeItems.length === 1 ? '' : 's'} de ${entityName}. ${registraMsg}`
                    }
                />

                {!reconcileActive && showReconcileWarning && (
                    <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-left text-xs text-amber-300">
                        <Icon name="warning" className="text-base shrink-0 mt-px" />
                        <span>
                            No hay una sesión de «Hacer cuentas» abierta. Este pago va a quedar en
                            el <strong>historial del gasto</strong>, pero{' '}
                            <strong>no en el historial de cuentas</strong>.
                        </span>
                    </div>
                )}

                {isSingle && single?.is_postponed && (
                    <div className="mb-3 flex items-start gap-2 rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-left text-xs text-sky-300">
                        <Icon name="schedule" className="text-base shrink-0 mt-px" />
                        <span>
                            Este gasto está postergado. Al pagarlo se le quita la postergación.
                        </span>
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
