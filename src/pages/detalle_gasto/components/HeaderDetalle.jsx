import { ChipTipoGasto } from '@/components/ChipTipoGasto';
import ActionsMenu from '@/components/ActionsMenu';
import { useSnackbarStore } from '@/store/use-snackbar-store';
import { t } from '@/i18n';

export default function HeaderDetalle({
    gasto,
    marcarProxima,
    abrirEditar,
    abrirTransferir,
    abrirCompartir,
    abrirEliminar,
    transferLock,
    onRevertLast,
    revertLastDisabled = false,
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
                            ? t('detalleGasto.markInstallmentAsCollected')
                            : t('detalleGasto.markInstallmentAsPaid')}
                    </button>
                ) : null}

                <ActionsMenu
                    label={t('detalleGasto.expenseOptions')}
                    items={[
                        ...(onRevertLast
                            ? [
                                  {
                                      icon: 'undo',
                                      label: gasto.shared_counterparty
                                          ? t('detalleGasto.requestReversalOfTheLastPayment')
                                          : t('detalleGasto.revertLastPayment'),
                                      disabled: revertLastDisabled,
                                      onClick: onRevertLast,
                                  },
                              ]
                            : []),
                        {
                            icon: 'edit',
                            label: t('detalleGasto.editExpense'),
                            onClick: abrirEditar,
                        },
                        {
                            icon: transferLock ? 'lock' : 'swap_horiz',
                            label: t('detalleGasto.transferToAnotherEntity'),
                            onClick: transferLock ? avisarTransferBloqueado : abrirTransferir,
                        },
                        ...(gasto.can_share
                            ? [
                                  {
                                      icon: 'group_add',
                                      label: t('detalleGasto.shareExpense'),
                                      onClick: abrirCompartir,
                                  },
                              ]
                            : []),
                        {
                            icon: 'delete',
                            label: t('detalleGasto.deleteExpense'),
                            tone: 'danger',
                            onClick: abrirEliminar,
                        },
                    ]}
                />
            </div>
        </div>
    );
}
