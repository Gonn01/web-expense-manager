import BrandHeader from '../components/BrandHeader';
import LoginForm from './components/LoginForm';
import SessionExpiredNotice from './components/SessionExpiredNotice';
import GoogleButton from '../components/GoogleButton';
import { useLogin } from './hooks/use-login';
import { useGoogleAuth } from '../hooks/use-google-auth';

export default function Login() {
    const { loading, error, setError, sessionExpired, handleLogin } = useLogin();
    const { loginGoogle, loading: loadingGoogle } = useGoogleAuth();

    return (
        <div className="min-h-dvh w-full flex justify-center items-center bg-background-dark text-white px-4 py-16 font-display">
            <div className="w-full max-w-lg bg-emerald-950/40 border border-emerald-900/40 rounded-2xl p-6 sm:p-8 shadow backdrop-blur-sm">
                <BrandHeader title="Expense Manager" subtitle="Controla tus finanzas personales" />

                {sessionExpired && <SessionExpiredNotice />}

                <div className="rounded-xl border border-gray-700/50 bg-black/20 p-6 sm:p-8">
                    <LoginForm
                        loading={loading}
                        error={error}
                        onErrorClear={() => setError('')}
                        onSubmit={handleLogin}
                    />

                    <div className="relative my-6">
                        <div aria-hidden="true" className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-emerald-900/40"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-2 text-sm text-emerald-300/70">O continúa con</span>
                        </div>
                    </div>

                    <GoogleButton loading={loadingGoogle} onClick={loginGoogle} />
                </div>

                <p className="mt-6 text-center text-sm text-emerald-300/70">
                    ¿No tienes una cuenta?{' '}
                    <a
                        href="/register"
                        className="font-semibold text-primary hover:text-primary/80"
                    >
                        Regístrate
                    </a>
                </p>
            </div>
        </div>
    );
}
