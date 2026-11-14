import { useMemo, useState } from 'react';
import useAuth from '@/store/use-auth-store';
import HistorialEvento from './HistorialEvento';
import { paymentNumbers } from '../utils/historial-eventos';

export default function HistorialSection({
    gasto,
    settlementActive = false,
    onRevert,
    onCancelReversion,
}) {
    const [expanded, setExpanded] = useState(true);
    const { user } = useAuth();

    const movements = useMemo(() => gasto.movements ?? [], [gasto.movements]);
    const eventos = useMemo(
        () => [...movements].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        [movements],
    );
    const numbers = useMemo(() => paymentNumbers(movements), [movements]);

    return (
        <section className="flex flex-col gap-4">
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center justify-between w-full"
            >
                <h2 className="text-xl font-bold">Historial</h2>
                <span
                    className={`material-symbols-outlined text-2xl text-slate-500 dark:text-[#9eb7a8] transition-transform ${expanded ? 'rotate-180' : ''}`}
                >
                    expand_more
                </span>
            </button>

            {expanded &&
                (eventos.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-[#9eb7a8]">
                        Sin actividad registrada.
                    </p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {eventos.map((movement) => (
                            <HistorialEvento
                                key={movement.id}
                                movement={movement}
                                gasto={gasto}
                                number={numbers.get(movement.id)}
                                currentUserId={user?.id}
                                settlementActive={settlementActive}
                                onRevert={onRevert}
                                onCancelReversion={onCancelReversion}
                            />
                        ))}
                    </div>
                ))}
        </section>
    );
}
