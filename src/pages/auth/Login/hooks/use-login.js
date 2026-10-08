import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/store/use-auth-store';
import { clearSessionExpired, isSessionExpiredMarked } from '@/utils/session-expired';

export function useLogin() {
    const nav = useNavigate();
    const auth = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Llegamos acá porque la API rechazó el token (ver interceptor de axios).
    // Se lee una vez y se limpia la marca para que no reaparezca al recargar.
    const [sessionExpired] = useState(isSessionExpiredMarked);
    useEffect(() => {
        clearSessionExpired();
    }, []);

    const validar = ({ email, password }) => {
        if (!email.includes('@')) return 'Email inválido';
        if (!password || password.length < 6)
            return 'La contraseña debe tener al menos 6 caracteres';
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
            setError(err.message || 'Error de autenticación');
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
