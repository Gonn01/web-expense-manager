import { useState } from 'react';
import { requestPasswordReset } from '@/services/api';
import { t } from '@/i18n';

export function useForgotPassword() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sentTo, setSentTo] = useState('');

    const handleSubmit = async ({ email }) => {
        const trimmed = email.trim();
        if (!trimmed.includes('@')) {
            setError(t('auth.invalidEmail'));
            return false;
        }

        try {
            setLoading(true);
            setError('');
            await requestPasswordReset(trimmed);
            setSentTo(trimmed);
            return true;
        } catch (err) {
            setError(err.message || t('auth.authenticationError'));
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, setError, sentTo, handleSubmit };
}
