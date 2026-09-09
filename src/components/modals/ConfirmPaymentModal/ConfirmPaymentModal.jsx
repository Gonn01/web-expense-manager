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

    const registraMsg = reconcileActive
        ? 'Se registra al terminar las cuentas.'
        : 'Se registra ahora en el historial de este gasto.';

    return createPortal(
        <ModalOverlay onClose={onCancel}>
            <ModalContainer>
                <ModalHeader
                    icon="payments"
                    title={isSingle ? 'Marcar Pago de Cuota' : 'Marcar Pago de Cuotas'}
                    description={
                        isSingle
                            ? `Vas a marcar el pago de ${single.name} en ${entityName}. ${registraMsg}`
                            : `Vas a marcar el pago de ${activeItems.length} gasto${
                                  activeItems.length === 1 ? '' : 's'
                              } activo${activeItems.length === 1 ? '' : 's'} de ${entityName}. ${registraMsg}`
                    }
                />

                {!reconcileActive && (
                    <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-left text-xs text-amber-300">
                        <Icon name="warning" className="text-base shrink-0 mt-px" />
                        <span>
                            No hay una sesión de «Hacer cuentas» abierta. Este pago va a quedar en
                            el <strong>historial del gasto</strong>, pero{' '}
                            <strong>no en el historial de cuentas</strong>.
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
