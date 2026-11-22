import Icon from '@/components/Icon';
import { useSnackbarStore } from '@/store/use-snackbar-store';
import { MERCADO_PAGO_URL } from '@/utils/mercado-pago';
import { t } from '@/i18n';

export default function MercadoPagoCard({ alias, onEdit }) {
    const transfer = async () => {
        const snackbar = useSnackbarStore.getState();
        try {
            await navigator.clipboard.writeText(alias);
        } catch {
            snackbar.show(t('common.couldnTCopyToClipboard'), 'error');
            return;
        }
        snackbar.show(t('detalleEntidad.mercadoPagoAliasCopied'), 'success');
        window.open(MERCADO_PAGO_URL, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 dark:border-[#29382f] bg-white dark:bg-[#111714] px-4 py-3">
            <Icon name="account_balance_wallet" className="text-primary" />
            <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500 dark:text-[#9eb7a8]">
                    {t('detalleEntidad.mercadoPagoAlias')}
                </p>
                <p className="truncate font-medium text-slate-900 dark:text-white">
                    {alias || t('detalleEntidad.mercadoPagoNoAlias')}
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 ml-auto">
                <button
                    type="button"
                    onClick={onEdit}
                    className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#29382f] cursor-pointer"
                >
                    <Icon name={alias ? 'edit' : 'add'} className="text-base" />
                    {alias
                        ? t('detalleEntidad.mercadoPagoEditAlias')
                        : t('detalleEntidad.mercadoPagoAddAlias')}
                </button>
                {alias && (
                    <button
                        type="button"
                        onClick={transfer}
                        className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-[#111714] hover:opacity-80 cursor-pointer"
                    >
                        <Icon name="open_in_new" className="text-base" />
                        {t('detalleEntidad.mercadoPagoTransfer')}
                    </button>
                )}
            </div>
        </div>
    );
}
