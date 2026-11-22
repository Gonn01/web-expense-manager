import { useEffect, useState } from 'react';
import { useDiscardGuard } from '@/hooks/use-discard-guard';
import { isValidMercadoPagoAlias } from '@/utils/mercado-pago';
import { t } from '@/i18n';

export default function MercadoPagoAliasModal({ initialAlias, onClose, onSave, saving }) {
    const initial = initialAlias ?? '';
    const [alias, setAlias] = useState(initial);
    const [error, setError] = useState('');

    const trimmed = alias.trim();
    const dirty = trimmed !== initial;
    const requestClose = useDiscardGuard(dirty, onClose, { busy: saving });

    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && requestClose();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [requestClose]);

    const submit = () => {
        if (!isValidMercadoPagoAlias(trimmed)) {
            setError(t('detalleEntidad.mercadoPagoInvalidAlias'));
            return;
        }
        onSave(trimmed || null);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onMouseDown={(e) => e.target === e.currentTarget && requestClose()}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="mercado-pago-alias-title"
                className="w-full max-w-md max-h-full overflow-y-auto rounded-xl bg-white dark:bg-zinc-900 p-4 sm:p-6 shadow-xl"
            >
                <h2
                    id="mercado-pago-alias-title"
                    className="mb-4 text-xl font-bold text-slate-900 dark:text-white"
                >
                    {t('detalleEntidad.mercadoPagoAlias')}
                </h2>
                <label className="block text-sm text-zinc-600 dark:text-zinc-300">
                    {t('detalleEntidad.mercadoPagoAliasHint')}
                    <input
                        type="text"
                        value={alias}
                        disabled={saving}
                        maxLength={20}
                        autoFocus
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        onChange={(e) => {
                            setAlias(e.target.value);
                            setError('');
                        }}
                        className="mt-2 w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-slate-900 dark:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    />
                </label>
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                <div className="mt-6 flex justify-between gap-3">
                    <button
                        type="button"
                        disabled={saving}
                        onClick={requestClose}
                        className="rounded-lg bg-zinc-300 px-4 py-2 text-black hover:bg-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        type="button"
                        disabled={saving || !dirty}
                        onClick={submit}
                        className="btn-save relative rounded-lg bg-primary px-4 py-2 font-bold text-background-dark"
                    >
                        <span className={saving ? 'invisible' : ''}>
                            {t('detalleEntidad.save')}
                        </span>
                        {saving && (
                            <span className="absolute inset-0 m-auto h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
