import { useState } from 'react';
import { validatePasswordChange } from '@/utils/validate-password-change';
import { t } from '@/i18n';

const EMPTY_FORM = { currentPassword: '', newPassword: '', confirmPassword: '' };
const INPUT_CLASS =
    'rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-background-dark px-3 py-2 text-sm text-slate-900 dark:text-white';

export function PasswordCard({ hasPassword, loading, onSave }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [error, setError] = useState('');

    if (hasPassword === null) return null;

    const change = (field) => (event) => {
        setError('');
        setForm((current) => ({ ...current, [field]: event.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const errorKey = validatePasswordChange({ hasPassword, ...form });
        if (errorKey) {
            setError(t(errorKey));
            return;
        }
        const saved = await onSave({
            currentPassword: hasPassword ? form.currentPassword : undefined,
            newPassword: form.newPassword,
        });
        if (saved) setForm(EMPTY_FORM);
    };

    const fields = [
        ...(hasPassword
            ? [
                  {
                      name: 'currentPassword',
                      label: 'passwordCurrent',
                      autoComplete: 'current-password',
                  },
              ]
            : []),
        { name: 'newPassword', label: 'passwordNew', autoComplete: 'new-password' },
        { name: 'confirmPassword', label: 'passwordConfirm', autoComplete: 'new-password' },
    ];

    return (
        <div className="rounded-2xl border border-black/10 dark:border-white/10 p-4 bg-white/70 dark:bg-background-dark/70">
            <h2 className="text-base font-medium mb-1 text-slate-900 dark:text-white">
                {t('configuracion.passwordTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                {t(
                    hasPassword
                        ? 'configuracion.passwordChangeHint'
                        : 'configuracion.passwordDefineHint',
                )}
            </p>

            <form className="space-y-3 text-sm" onSubmit={handleSubmit}>
                {fields.map(({ name, label, autoComplete }) => (
                    <div key={name} className="flex flex-col gap-1">
                        <label className="text-slate-600 dark:text-slate-300" htmlFor={name}>
                            {t(`configuracion.${label}`)}
                        </label>
                        <input
                            id={name}
                            type="password"
                            autoComplete={autoComplete}
                            className={INPUT_CLASS}
                            value={form[name]}
                            onChange={change(name)}
                        />
                    </div>
                ))}

                {error && (
                    <p role="alert" className="text-red-600 dark:text-red-400">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-bold bg-primary text-background-dark hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                    {loading
                        ? t('common.saving')
                        : t(
                              hasPassword
                                  ? 'configuracion.passwordChangeAction'
                                  : 'configuracion.passwordDefineAction',
                          )}
                </button>
            </form>
        </div>
    );
}
