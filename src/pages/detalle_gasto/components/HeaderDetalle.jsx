import { ChipTipoGasto } from '@/components/ChipTipoGasto';
import ActionsMenu from '@/components/ActionsMenu';
import { useSnackbarStore } from '@/store/use-snackbar-store';

export default function HeaderDetalle({
    gasto,
    marcarProxima,
    abrirEditar,
    abrirTransferir,
    abrirEliminar,
    transferLock,
}) {
    const avisarTransferBloqueado = () =>
        useSnackbarStore.getState().show(transferLock, 'error', 'lock');

    return (
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="min-w-0">
                <p className="text-3xl sm:text-4xl font-black tracking-[-0.033em] break-words">
                    {gasto.name}
                </p>
                <div className="mt-2">
                    <ChipTipoGasto fijo={gasto.fixed_expense} tipo={gasto.type}></ChipTipoGasto>
                </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                {gasto.finalization_date == null ? (
                    <button
                        onClick={marcarProxima}
                        className="flex-1 sm:flex-none cursor-pointer h-10 px-4 rounded-lg bg-primary text-background-dark text-sm font-bold hover:bg-opacity-90 transition-opacity"
                    >
                        {gasto.type === 'INGRESO'
                            ? 'Marcar cuota como cobrada'
                            : 'Marcar cuota como pagada'}
                    </button>
                ) : null}

                <ActionsMenu
                    label="Opciones del gasto"
                    items={[
                        {
                            icon: 'edit',
                            label: 'Editar gasto',
                            onClick: abrirEditar,
                        },
                        {
                            icon: transferLock ? 'lock' : 'swap_horiz',
                            label: 'Transferir a otra entidad',
                            onClick: transferLock ? avisarTransferBloqueado : abrirTransferir,
                        },
                        {
                            icon: 'delete',
                            label: 'Eliminar gasto',
                            tone: 'danger',
                            onClick: abrirEliminar,
                        },
                    ]}
                />
            </div>
        </div>
    );
}
