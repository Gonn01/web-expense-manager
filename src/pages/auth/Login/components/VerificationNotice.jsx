import Icon from '@/components/Icon';
import { t } from '@/i18n';

export default function VerificationNotice({ email, resending, message, onResend }) {
    return (
        <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-3 text-sm text-amber-800 dark:text-amber-100"
        >
            <Icon name="mark_email_unread" className="text-amber-600 dark:text-amber-300" />
            <div className="min-w-0 flex-1 space-y-2">
                <p className="font-semibold">{t('auth.verifyEmailTitle')}</p>
                <p className="wrap-break-word text-amber-800/90 dark:text-amber-100/80">
                    {t('auth.verifyEmailMessage', { email })}
                </p>
                {message ? (
                    <p className="font-medium" role="status">
                        {message}
                    </p>
                ) : (
                    <button
                        type="button"
                        onClick={onResend}
                        disabled={resending}
                        className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-600 dark:text-primary dark:hover:text-primary/80 disabled:opacity-60"
                    >
                        {resending && (
                            <Icon name="progress_activity" className="animate-spin text-sm" />
                        )}
                        {t('auth.resendVerification')}
                    </button>
                )}
            </div>
        </div>
    );
}
