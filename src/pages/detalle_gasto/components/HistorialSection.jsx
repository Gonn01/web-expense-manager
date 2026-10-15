import { useState } from 'react';
import Icon from '@/components/Icon';

const EVENT_ICONS = {
    CREATION: 'add_circle',
    PAYMENT: 'check_circle',
    REFUND: 'undo',
    EDITED: 'edit',
    DELETE: 'delete',
    RESTORE: 'restore',
};

function getEventTitle(movement, gasto) {
    switch (movement.movement_type) {
        case 'CREATION':
            return 'Gasto creado';
        case 'PAYMENT': {
            const isFinalization =
                gasto.finalization_date &&
                movement.payment_date &&
                new Date(movement.payment_date).getTime() === new Date(gasto.finalization_date).getTime();

            if (isFinalization) return 'Finalizado';
            return gasto.type === 'INGRESO' ? 'Cuota cobrada' : 'Cuota pagada';
        }
        case 'REFUND':
            return gasto.type === 'INGRESO' ? 'Cobro revertido' : 'Pago revertido';
        case 'EDITED':
            return movement.detail?.trim() ? movement.detail : 'Gasto editado';
        case 'DELETE':
            return 'Gasto eliminado';
        case 'RESTORE':
            return 'Gasto restaurado';
        default:
            return movement.movement_type;
    }
}

export default function HistorialSection({ gasto }) {
    const [expanded, setExpanded] = useState(false);

    const eventos = [...(gasto.movements ?? [])].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );

    return (
        <section className="flex flex-col gap-4">
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center justify-between w-full"
            >
                <h2 className="text-xl font-bold">Historial</h2>
                <span
                    className={`material-symbols-outlined text-2xl text-[#9eb7a8] transition-transform ${expanded ? 'rotate-180' : ''}`}
                >
                    expand_more
                </span>
            </button>

            {expanded && (
                eventos.length === 0 ? (
                    <p className="text-sm text-[#9eb7a8]">Sin actividad registrada.</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {eventos.map((movimiento) => {
                            const formattedDate = movimiento.created_at
                                ? new Date(movimiento.created_at).toLocaleString('es-AR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })
                                : null;

                            return (
                                <div
                                    key={movimiento.id}
                                    className="flex items-center gap-4 p-4 rounded-lg shadow-sm bg-[#111714]"
                                >
                                    <Icon
                                        name={EVENT_ICONS[movimiento.movement_type] ?? 'event'}
                                        className="text-primary"
                                    />
                                    <div className="flex flex-col">
                                        <p className="font-medium text-white whitespace-pre-line">
                                            {getEventTitle(movimiento, gasto)}
                                        </p>
                                        <p className="text-sm text-[#9eb7a8]">{formattedDate}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            )}
        </section>
    );
}
