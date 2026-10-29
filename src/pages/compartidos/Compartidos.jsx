import { useCompartidos } from './hooks/use-compartidos';
import RecibidoCard from './components/RecibidoCard';
import EmitidoCard from './components/EmitidoCard';
import PagoCompartidoCard from './components/PagoCompartidoCard';
import AprobarModal from './components/AprobarModal';
import NewExpenseModal from '@/components/modals/Expenses/NewExpense/NewExpenseModal';
import Loader from '@/components/Loader';
import Icon from '@/components/Icon';
import InfoTooltip from '@/components/InfoTooltip';
import { useState } from 'react';

export default function Compartidos() {
    const {
        compartidos,
        pagos,
        loading,
        loadingAction,
        aprobar,
        rechazar,
        reintentar,
        confirmarPago,
        rechazarPago,
        crearGasto,
    } = useCompartidos();
    const [aprobarTarget, setAprobarTarget] = useState(null);
    const [openNewExpense, setOpenNewExpense] = useState(false);
    const [savingExpense, setSavingExpense] = useState(false);

    const handleAprobar = async (entityId, newEntityName) => {
        await aprobar(aprobarTarget.id, entityId, newEntityName);
        setAprobarTarget(null);
    };

    const handleCreateExpense = async (payload) => {
        setSavingExpense(true);
        try {
            await crearGasto(payload);
            setOpenNewExpense(false);
        } catch (err) {
            console.error('Error creando gasto:', err);
        } finally {
            setSavingExpense(false);
        }
    };

    const recibidosPendientes = compartidos.recibidos.filter(
        (r) => r.status === 'PENDING_APPROVAL',
    );
    const recibidosRechazados = compartidos.recibidos.filter((r) => r.status === 'REJECTED');
    const emitidosPendientes = compartidos.emitidos.filter(
        (e) => e.copy_status === 'PENDING_APPROVAL',
    );
    const emitidosRechazados = compartidos.emitidos.filter((e) => e.copy_status === 'REJECTED');

    const needsAction = [
        ...pagos.porConfirmar.map((p) => (
            <PagoCompartidoCard
                key={`pago-${p.movement_id}`}
                pago={p}
                variant="porConfirmar"
                loadingId={loadingAction}
                onConfirmar={(id) => confirmarPago(id)}
                onRechazar={(id) => rechazarPago(id)}
            />
        )),
        ...recibidosPendientes.map((item) => (
            <RecibidoCard
                key={`recibido-${item.id}`}
                item={item}
                loadingId={loadingAction}
                onAprobar={(g) => setAprobarTarget(g)}
                onRechazar={(id) => rechazar(id)}
            />
        )),
        ...emitidosRechazados.map((item) => (
            <EmitidoCard
                key={`emitido-${item.id}`}
                item={item}
                loadingId={loadingAction}
                onReintentar={(id) => reintentar(id)}
            />
        )),
    ];

    const waitingOther = [
        ...emitidosPendientes.map((item) => (
            <EmitidoCard
                key={`emitido-${item.id}`}
                item={item}
                loadingId={loadingAction}
                onReintentar={(id) => reintentar(id)}
            />
        )),
        ...pagos.esperando.map((p) => (
            <PagoCompartidoCard
                key={`pago-${p.movement_id}`}
                pago={p}
                variant="esperando"
                loadingId={loadingAction}
            />
        )),
    ];

    const rejected = recibidosRechazados.map((item) => (
        <RecibidoCard
            key={`recibido-${item.id}`}
            item={item}
            loadingId={loadingAction}
            onAprobar={(g) => setAprobarTarget(g)}
            onRechazar={(id) => rechazar(id)}
        />
    ));

    const isEmpty = needsAction.length === 0 && waitingOther.length === 0 && rejected.length === 0;

    if (loading) return <Loader />;

    return (
        <>
            <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-black dark:text-white flex items-center gap-2">
                    Compartidos
                    <InfoTooltip
                        align="start"
                        text={
                            'Esto aparece cuando vinculás una entidad a otra persona: los ' +
                            'gastos y pagos que registra esa entidad le llegan acá para que ' +
                            'los apruebe o confirme, y viceversa con los suyos.'
                        }
                    />
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Gastos y pagos compartidos que todavía están pendientes
                </p>
            </div>

            {isEmpty ? (
                <EmptyState onNewExpense={() => setOpenNewExpense(true)} />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    <SubSection title="Necesita tu acción" icon="priority_high">
                        {needsAction}
                    </SubSection>

                    <SubSection title="Esperando a la otra persona" icon="hourglass_top">
                        {waitingOther}
                    </SubSection>
                </div>
            )}

            {openNewExpense && (
                <NewExpenseModal
                    onClose={() => setOpenNewExpense(false)}
                    onSave={handleCreateExpense}
                    saving={savingExpense}
                />
            )}

            {rejected.length > 0 && (
                <div className="mt-6">
                    <SubSection title="Rechazados por vos" icon="block">
                        {rejected}
                    </SubSection>
                </div>
            )}

            {aprobarTarget && (
                <AprobarModal
                    open={true}
                    gasto={aprobarTarget}
                    loading={loadingAction === aprobarTarget.id}
                    onClose={() => setAprobarTarget(null)}
                    onConfirm={handleAprobar}
                />
            )}
        </>
    );
}

function EmptyState({ onNewExpense }) {
    return (
        <div className="flex flex-col items-center text-center gap-3 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 px-6 py-10">
            <Icon name="group" className="text-4xl text-zinc-400 dark:text-zinc-500" />
            <p className="text-lg font-bold text-zinc-800 dark:text-white">
                No tenés gastos compartidos pendientes
            </p>
            <p className="max-w-md text-sm text-zinc-500 dark:text-zinc-400">
                Para compartir un gasto con alguien, podés vincular una entidad a su usuario usando
                su email, desde el detalle de la entidad. El gasto le va a llegar para su
                aprobación.
            </p>
            <button
                onClick={onNewExpense}
                className="cursor-pointer mt-2 flex items-center h-11 px-5 rounded-lg bg-primary text-background-dark font-bold"
            >
                <Icon name="add_circle" className="mr-2" />
                Crear Gasto / Deuda
            </button>
        </div>
    );
}

function SubSection({ title, icon, children }) {
    const items = Array.isArray(children) ? children.filter(Boolean) : children ? [children] : [];

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-200">
                <Icon name={icon} className="text-base" />
                {title}
                <span className="text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                    {items.length}
                </span>
            </div>

            {items.length === 0 ? (
                <p className="text-sm text-zinc-400 dark:text-zinc-600 pl-6">Nada por acá.</p>
            ) : (
                <div className="flex flex-col gap-3">{items}</div>
            )}
        </div>
    );
}
