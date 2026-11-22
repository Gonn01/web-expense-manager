import BrandHeader from '../components/BrandHeader';
import LoginForm from './components/LoginForm';
import SessionExpiredNotice from './components/SessionExpiredNotice';
import GoogleButton from '../components/GoogleButton';
import GoogleLinkDialog from '../components/GoogleLinkDialog';
import { useLogin } from './hooks/use-login';
import { useGoogleAuth } from '../hooks/use-google-auth';
import { t } from '@/i18n';

export default function Login() {
    const { loading, error, setError, sessionExpired, handleLogin } = useLogin();
    const { loginGoogle, loading: loadingGoogle, googleAvailable, linkDialog } = useGoogleAuth();

    return (
        <div className="min-h-dvh w-full flex justify-center items-center bg-background-light dark:bg-background-dark text-slate-900 dark:text-white px-4 py-8 sm:py-16 font-display">
            <div className="w-full max-w-lg bg-white/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-4 sm:p-8 shadow backdrop-blur-sm">
                <BrandHeader
                    title="Expense Manager"
                    subtitle={t('auth.takeControlOfYourPersonalFinances')}
                />

                {sessionExpired && <SessionExpiredNotice />}

                <div className="rounded-xl border border-slate-200 dark:border-gray-700/50 bg-white dark:bg-black/20 p-4 sm:p-8">
                    <LoginForm
                        loading={loading}
                        error={error}
                        onErrorClear={() => setError('')}
                        onSubmit={handleLogin}
                    />

                    <div className="relative my-6">
                        <div aria-hidden="true" className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-emerald-200 dark:border-emerald-900/40"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-2 text-sm text-emerald-700 dark:text-emerald-300/70">
                                {t('auth.orContinueWith')}
                            </span>
                        </div>
                    </div>

                    <GoogleButton
                        loading={loadingGoogle}
                        available={googleAvailable}
                        onClick={loginGoogle}
                    />
                </div>

                <p className="mt-6 text-center text-sm text-emerald-700 dark:text-emerald-300/70">
                    {t('auth.donTHaveAnAccount')}{' '}
                    <a
                        href="/register"
                        className="font-semibold text-primary hover:text-primary/80"
                    >
                        {t('auth.signUp2')}
                    </a>
                </p>
            </div>
            <GoogleLinkDialog {...linkDialog} />
        </div>
    );
}
