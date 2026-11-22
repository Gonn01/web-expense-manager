import BrandHeader from '../components/BrandHeader';
import GoogleButton from '../components/GoogleButton';
import RegisterForm from './components/RegisterForm';
import { useRegister } from './hooks/use-register';
import { useGoogleAuth } from '../hooks/use-google-auth';
import { t } from '@/i18n';

export default function Register() {
    const { loading, error, setError, handleRegister } = useRegister();
    const { loginGoogle, loading: loadingGoogle, googleAvailable } = useGoogleAuth();

    return (
        <div className="min-h-dvh w-full flex justify-center items-center bg-background-light dark:bg-background-dark text-slate-900 dark:text-white px-4 py-16 font-display">
            <div className="w-full max-w-lg bg-white/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-6 sm:p-8 shadow backdrop-blur-sm">
                <BrandHeader title="Expense Manager" subtitle={t('auth.createYourNewAccount')} />

                <div className="rounded-xl border border-slate-200 dark:border-gray-700/50 bg-white dark:bg-black/20 p-6 sm:p-8">
                    <RegisterForm
                        loading={loading}
                        error={error}
                        onErrorClear={() => setError('')}
                        onSubmit={handleRegister}
                    />

                    <div className="relative my-6">
                        <div aria-hidden="true" className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-emerald-200 dark:border-emerald-900/40"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-2 text-sm text-emerald-700 dark:text-emerald-300/70">
                                {t('auth.orSignUpWith')}
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
                    {t('auth.alreadyHaveAnAccount')}{' '}
                    <a href="/login" className="font-semibold text-primary hover:text-primary/80">
                        {t('auth.signIn')}
                    </a>
                </p>
            </div>
        </div>
    );
}
