import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '@/services/api';
import { t } from '@/i18n';

export function useRegister() {
    const nav = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validar = ({ name, email, password }) => {
        if (!name || name.trim().length < 2) return t('auth.theNameMustBeAtLeast2');
        if (!email.includes('@')) return t('auth.invalidEmail');
        if (!password || password.length < 6) return t('auth.thePasswordMustBeAtLeast6');
        return '';
    };

    const handleRegister = async ({ name, email, password }) => {
        const msg = validar({ name, email, password });
        if (msg) {
            setError(msg);
            return false;
        }

        try {
            setLoading(true);
            setError('');
            const result = await register({ name, email, password });
            nav('/login', {
                state: {
                    registeredEmail: email.trim(),
                    verificationSent: Boolean(result?.verification_sent),
                },
            });
            return true;
        } catch (err) {
            setError(err.message || t('auth.errorRegisteringUser'));
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        setError,
        handleRegister,
    };
}
