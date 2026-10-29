import { useState } from 'react';
import TextInput from '@/components/TextInput';
import PasswordInput from '../../components/PasswordInput';
import ErrorMessage from '../../components/ErrorMessage';
import SubmitButton from '@/components/SubmitButton';

export default function LoginForm({ loading, error, onErrorClear, onSubmit }) {
    const [form, setForm] = useState({
        email: '',
        password: '',
    });

    const onChange = (key, value) => {
        setForm({ ...form, [key]: value });
        if (error) onErrorClear();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSubmit(form);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <TextInput
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => onChange('email', e.target.value)}
                placeholder="Ej: juan@email.com"
            />

            <PasswordInput
                value={form.password}
                onChange={(e) => onChange('password', e.target.value)}
                placeholder="Ej: MiClave123"
            />

            {error && <ErrorMessage message={error} />}

            <SubmitButton loading={loading}>Iniciar Sesión</SubmitButton>
        </form>
    );
}
