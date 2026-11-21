import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/store/use-auth-store';
import { clearSessionExpired, isSessionExpiredMarked } from '@/utils/session-expired';
import { t } from '@/i18n';

export function useLogin() {
    const nav = useNavigate();
    const auth = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [sessionExpired] = useState(isSessionExpiredMarked);
    useEffect(() => {
        clearSessionExpired();
    }, []);

    const validar = ({ email, password }) => {
        if (!email.includes('@')) return t('auth.invalidEmail');
        if (!password || password.length < 6) return t('auth.thePasswordMustBeAtLeast6');
        return '';
    };

    const handleLogin = async ({ email, password }) => {
        const msg = validar({ email, password });
        if (msg) {
            setError(msg);
            return false;
        }

        try {
            setLoading(true);
            setError('');
            await auth.login({ email, password });
            nav('/app/dashboard', { replace: true });
            return true;
        } catch (err) {
            setError(err.message || t('auth.authenticationError'));
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        setError,
        sessionExpired,
        handleLogin,
    };
}
