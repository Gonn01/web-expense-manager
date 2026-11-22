import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/store/use-auth-store';
import { useDialogStore } from '@/store/use-dialog-store';
import { notifyError } from '@/services/error-handler';
import { t } from '@/i18n';
import { auth, googleProvider } from '../../../../firebase';
import { signInWithPopup } from 'firebase/auth';

export function useGoogleAuth() {
    const [loading, setLoading] = useState(false);
    const [pendingIdToken, setPendingIdToken] = useState(null);
    const [linkError, setLinkError] = useState('');
    const nav = useNavigate();
    const { loginWithFirebase } = useAuth();

    const googleAvailable = Boolean(auth);

    const completeLogin = async (idToken, linkOptions = {}) => {
        await loginWithFirebase({ idToken, ...linkOptions });
        setPendingIdToken(null);
        nav('/app/dashboard', { replace: true });
    };

    const loginGoogle = async () => {
        if (!googleAvailable) return;

        let idToken;
        try {
            setLoading(true);
            const result = await signInWithPopup(auth, googleProvider);
            idToken = await result.user.getIdToken();
            await completeLogin(idToken);
        } catch (err) {
            if (err.code === 'VINCULACION_REQUIERE_CONTRASENA') {
                setLinkError('');
                setPendingIdToken(idToken);
            } else if (err.isApiError) {
                notifyError(err);
            } else {
                console.error('Error con Google Auth', err);
            }
        } finally {
            setLoading(false);
        }
    };

    const submitLink = async (linkOptions) => {
        try {
            setLoading(true);
            setLinkError('');
            await completeLogin(pendingIdToken, linkOptions);
        } catch (err) {
            if (err.code === 'CONTRASENA_INCORRECTA') {
                setLinkError(err.message);
            } else {
                setPendingIdToken(null);
                notifyError(err);
            }
        } finally {
            setLoading(false);
        }
    };

    const confirmLinkWithPassword = (password) => submitLink({ password });

    const linkDiscardingPassword = async () => {
        const confirmed = await useDialogStore.getState().confirm({
            title: t('auth.linkGoogleForgotTitle'),
            message: t('auth.linkGoogleForgotMessage'),
            tone: 'warning',
            confirmLabel: t('auth.linkGoogleForgotConfirm'),
        });
        if (confirmed) await submitLink({ discardPassword: true });
    };

    const cancelLink = () => {
        setPendingIdToken(null);
        setLinkError('');
    };

    return {
        loginGoogle,
        loading,
        googleAvailable,
        linkDialog: {
            open: Boolean(pendingIdToken),
            loading,
            error: linkError,
            onSubmit: confirmLinkWithPassword,
            onForgot: linkDiscardingPassword,
            onCancel: cancelLink,
        },
    };
}
