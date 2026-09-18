import { useCompartidos } from './hooks/use-compartidos';
import RecibidoCard from './components/RecibidoCard';
import EmitidoCard from './components/EmitidoCard';
import PagoCompartidoCard from './components/PagoCompartidoCard';
import AprobarModal from './components/AprobarModal';
import Loader from '@/components/Loader';
import Icon from '@/components/Icon';
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
    } = useCompartidos();
    const [aprobarTarget, setAprobarTarget] = useState(null);

    const handleAprobar = async (entityId, newEntityName) => {
        await aprobar(aprobarTarget.id, entityId, newEntityName);
        setAprobarTarget(null);
    };

    // El backend devuelve recibidos/emitidos en PENDING_APPROVAL o REJECTED
    // (nada mas viejo que eso). Cada grupo junta gastos y pagos - TypeBadge
    // distingue el tipo dentro de cada tarjeta.
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
        // Un gasto emitido rechazado si tiene accion posible: reintentar.
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

    // Gastos recibidos que vos ya rechazaste: informativo, sin mas accion.
    const rejected = recibidosRechazados.map((item) => (
        <RecibidoCard
            key={`recibido-${item.id}`}
            item={item}
            loadingId={loadingAction}
            onAprobar={(g) => setAprobarTarget(g)}
            onRechazar={(id) => rechazar(id)}
        />
    ));

    if (loading) return <Loader />;

    return (
        <>
            <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-black dark:text-white">Compartidos</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Gastos y pagos compartidos que todavía están pendientes
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <SubSection title="Necesita tu acción" icon="priority_high">
                    {needsAction}
                </SubSection>

                <SubSection title="Esperando a la otra persona" icon="hourglass_top">
                    {waitingOther}
                </SubSection>
            </div>

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
