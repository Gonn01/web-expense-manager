import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '@/store/use-auth-store';
import { resendVerification } from '@/services/api';
import { clearSessionExpired, isSessionExpiredMarked } from '@/utils/session-expired';
import { t } from '@/i18n';

const EMAIL_NOT_VERIFIED = 'EMAIL_NO_VERIFICADO';

export function useLogin() {
    const nav = useNavigate();
    const location = useLocation();
    const auth = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [unverified, setUnverified] = useState(null);
    const [resending, setResending] = useState(false);
    const [verificationMessage, setVerificationMessage] = useState('');

    const [sessionExpired] = useState(isSessionExpiredMarked);
    const [registration] = useState(() => location.state ?? null);
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
            setUnverified(null);
            setVerificationMessage('');
            await auth.login({ email, password });
            nav('/app/dashboard', { replace: true });
            return true;
        } catch (err) {
            if (err.code === EMAIL_NOT_VERIFIED) {
                setUnverified({ email: email.trim(), password });
            } else {
                setError(err.message || t('auth.authenticationError'));
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (!unverified) return;
        try {
            setResending(true);
            setError('');
            const result = await resendVerification(unverified);
            setVerificationMessage(
                result?.already_verified
                    ? t('auth.alreadyVerified')
                    : t('auth.verificationResent', { email: unverified.email }),
            );
        } catch (err) {
            setError(err.message || t('auth.authenticationError'));
        } finally {
            setResending(false);
        }
    };

    const clearError = () => {
        setError('');
        setUnverified(null);
        setVerificationMessage('');
    };

    return {
        loading,
        error,
        clearError,
        sessionExpired,
        registration,
        unverified,
        resending,
        verificationMessage,
        handleLogin,
        handleResendVerification,
    };
}
