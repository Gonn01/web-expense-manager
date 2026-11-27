import { Link } from 'react-router-dom';
import Icon from '@/components/Icon';
import BrandHeader from '../components/BrandHeader';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import { useForgotPassword } from './hooks/use-forgot-password';
import { t } from '@/i18n';

export default function ForgotPassword() {
    const { loading, error, setError, sentTo, handleSubmit } = useForgotPassword();

    return (
        <div className="min-h-dvh w-full flex justify-center items-center bg-background-light dark:bg-background-dark text-slate-900 dark:text-white px-4 py-8 sm:py-16 font-display">
            <div className="w-full max-w-lg bg-white/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-4 sm:p-8 shadow backdrop-blur-sm">
                <BrandHeader
                    title={t('auth.forgotPasswordTitle')}
                    subtitle={t('auth.forgotPasswordSubtitle')}
                />

                <div className="rounded-xl border border-slate-200 dark:border-gray-700/50 bg-white dark:bg-black/20 p-4 sm:p-8">
                    {sentTo ? (
                        <div
                            role="status"
                            className="flex items-start gap-3 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-3 text-sm text-emerald-800 dark:text-emerald-100"
                        >
                            <Icon
                                name="mark_email_read"
                                className="text-emerald-600 dark:text-emerald-300"
                            />
                            <p className="min-w-0 wrap-break-word">
                                {t('auth.forgotPasswordSent', { email: sentTo })}
                            </p>
                        </div>
                    ) : (
                        <ForgotPasswordForm
                            loading={loading}
                            error={error}
                            onErrorClear={() => setError('')}
                            onSubmit={handleSubmit}
                        />
                    )}
                </div>

                <p className="mt-6 text-center text-sm">
                    <Link to="/login" className="font-semibold text-primary hover:text-primary/80">
                        {t('auth.backToSignIn')}
                    </Link>
                </p>
            </div>
        </div>
    );
}
