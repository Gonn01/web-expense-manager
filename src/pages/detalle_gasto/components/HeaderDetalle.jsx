import { ChipTipoGasto } from '@/components/ChipTipoGasto';

export default function HeaderDetalle({ gasto, marcarProxima, abrirEditar }) {
    return (
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
                <p className="text-4xl font-black tracking-[-0.033em]">{gasto.name}</p>
                <div className="mt-2">
                    <ChipTipoGasto fijo={gasto.fixed_expense} tipo={gasto.type}></ChipTipoGasto>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                {gasto.finalization_date == null ? (
                    <button
                        onClick={marcarProxima}
                        className="cursor-pointer h-10 px-4 rounded-lg bg-primary text-background-dark text-sm font-bold hover:bg-opacity-90 transition-opacity"
                    >
                        {gasto.type === 'INGRESO' ? 'Marcar cuota como cobrada' : 'Marcar cuota como pagada'}
                    </button>
                ) : null}

                <button
                    onClick={abrirEditar}
                    className="cursor-pointer h-10 px-4 rounded-lg bg-[#29382f] text-white text-sm font-bold hover:bg-opacity-80 transition-all"
                >
                    Editar
                </button>
            </div>
        </div>
    );
}
