import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { t } from '@/i18n';

export default function GoogleLinkDialog({ open, loading, error, onSubmit, onForgot, onCancel }) {
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (!open) setPassword('');
    }, [open]);

    if (!open) return null;

    const handleSubmit = (event) => {
        event.preventDefault();
        if (password) onSubmit(password);
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <form
                onSubmit={handleSubmit}
                role="dialog"
                aria-modal="true"
                aria-labelledby="google-link-title"
                className="w-full max-w-sm rounded-xl bg-white dark:bg-[#111714] p-6 border border-slate-200 dark:border-[#29382f] shadow-lg text-slate-900 dark:text-white"
            >
                <h2 id="google-link-title" className="text-lg font-bold">
                    {t('auth.linkGoogleTitle')}
                </h2>
                <p className="text-sm text-slate-500 dark:text-[#9eb7a8] mt-1">
                    {t('auth.linkGoogleMessage')}
                </p>

                <label
                    htmlFor="google-link-password"
                    className="block text-sm mt-4 mb-1 text-slate-600 dark:text-slate-300"
                >
                    {t('configuracion.passwordCurrent')}
                </label>
                <input
                    id="google-link-password"
                    type="password"
                    autoFocus
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-background-dark px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
                {error && (
                    <p role="alert" className="text-sm text-red-600 dark:text-red-400 mt-2">
                        {error}
                    </p>
                )}

                <button
                    type="button"
                    onClick={onForgot}
                    disabled={loading}
                    className="cursor-pointer text-sm font-semibold text-primary hover:text-primary/80 mt-3 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {t('auth.linkGoogleForgot')}
                </button>

                <div className="flex justify-end gap-2 mt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="cursor-pointer h-10 px-4 rounded-lg text-sm font-bold text-slate-500 dark:text-[#9eb7a8] hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !password}
                        className="cursor-pointer h-10 px-4 rounded-lg text-sm font-bold bg-primary text-background-dark hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {t('auth.linkGoogleAction')}
                    </button>
                </div>
            </form>
        </div>,
        document.body,
    );
}
