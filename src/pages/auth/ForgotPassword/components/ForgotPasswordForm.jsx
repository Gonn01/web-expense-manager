import { useState } from 'react';
import TextInput from '@/components/TextInput';
import SubmitButton from '@/components/SubmitButton';
import ErrorMessage from '../../components/ErrorMessage';
import { t } from '@/i18n';

export default function ForgotPasswordForm({ loading, error, onErrorClear, onSubmit }) {
    const [email, setEmail] = useState('');

    const onChange = (value) => {
        setEmail(value);
        if (error) onErrorClear();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSubmit({ email });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <TextInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => onChange(e.target.value)}
                placeholder={t('common.eGJohnEmailCom')}
            />

            {error && <ErrorMessage message={error} />}

            <SubmitButton loading={loading}>{t('auth.forgotPasswordSubmit')}</SubmitButton>
        </form>
    );
}
