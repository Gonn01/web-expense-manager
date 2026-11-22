import { useState } from 'react';
import Icon from '@/components/Icon';
import { useDialogStore } from '@/store/use-dialog-store';
import { countPagosByPurchase } from '@/utils/compartidos-pending';
import { countPendingResponses } from '@/utils/pending-responses';
import { t } from '@/i18n';
import AprobarModal from './AprobarModal';
import EdicionCard from './EdicionCard';
import PagoCompartidoCard from './PagoCompartidoCard';
import RecibidoCard from './RecibidoCard';
import ReversionCard from './ReversionCard';

export default function PendingResponsesSection({ shared, responses, onResolved }) {
    const [aprobarTarget, setAprobarTarget] = useState(null);
    const total = countPendingResponses(responses);
    if (total === 0 && !aprobarTarget) return null;

    const actionFor = (key) => shared.loadingActions.find((action) => action.id === key);
    const pagosByPurchase = countPagosByPurchase(responses.pagos);

    const respond = async (action, id) => {
        try {
            await action(id);
            await onResolved?.();
        } catch {}
    };

    const handleAprobar = async (entityId, newEntityName) => {
        try {
            await shared.aprobar(aprobarTarget.id, entityId, newEntityName);
            setAprobarTarget(null);
            await onResolved?.();
        } catch {}
    };

    const handleRechazar = (item) =>
        useDialogStore.getState().confirm({
            title: t('compartidos.rejectExpense'),
            message: t('shared.rejectConfirm', {
                name: item.name,
                sender: item.sender_name ?? t('people.otherPerson'),
            }),
            tone: 'danger',
            confirmLabel: t('compartidos.reject'),
            onConfirm: () => respond(shared.rechazar, item.id),
        });

    return (
        <section className="flex flex-col gap-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-200">
                <Icon name="priority_high" className="text-base" />
                {t('compartidos.needsYourAction')}
                <span className="text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                    {total}
                </span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
                {responses.recibidos.map((item) => (
                    <RecibidoCard
                        key={`recibido-${item.id}`}
                        item={item}
                        loading={actionFor(`gasto-${item.id}`)}
                        onAprobar={setAprobarTarget}
                        onRechazar={() => handleRechazar(item)}
                    />
                ))}
                {responses.pagos.map((pago) => (
                    <PagoCompartidoCard
                        key={`pago-${pago.movement_id}`}
                        pago={pago}
                        variant="porConfirmar"
                        pendingCount={pagosByPurchase.get(pago.purchase_id)}
                        loading={actionFor(`movement-${pago.movement_id}`)}
                        onConfirmar={(id) => respond(shared.confirmarPago, id)}
                        onRechazar={(id) => respond(shared.rechazarPago, id)}
                    />
                ))}
                {responses.reversiones.map((reversion) => (
                    <ReversionCard
                        key={`reversion-${reversion.movement_id}`}
                        reversion={reversion}
                        variant="porConfirmar"
                        loading={actionFor(`movement-${reversion.movement_id}`)}
                        onAceptar={(id) => respond(shared.aceptarReversion, id)}
                        onRechazar={(id) => respond(shared.rechazarReversion, id)}
                    />
                ))}
                {responses.ediciones.map((edicion) => (
                    <EdicionCard
                        key={`edicion-${edicion.id}`}
                        edicion={edicion}
                        variant="porConfirmar"
                        loading={actionFor(`edicion-${edicion.id}`)}
                        onAprobar={(id) => respond(shared.aprobarEdicion, id)}
                        onRechazar={(id) => respond(shared.rechazarEdicion, id)}
                    />
                ))}
            </div>
            {aprobarTarget && (
                <AprobarModal
                    open
                    gasto={aprobarTarget}
                    loading={actionFor(`gasto-${aprobarTarget.id}`)?.kind === 'aprobar'}
                    onClose={() => setAprobarTarget(null)}
                    onConfirm={handleAprobar}
                />
            )}
        </section>
    );
}
