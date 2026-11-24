import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { t } from '@/i18n';
import LoginForm from './LoginForm';

const renderForm = (props = {}) => {
    const onSubmit = vi.fn().mockResolvedValue();
    const onErrorClear = vi.fn();
    render(
        <LoginForm loading={false} onSubmit={onSubmit} onErrorClear={onErrorClear} {...props} />,
    );
    return { onSubmit, onErrorClear };
};

const emailInput = () => screen.getByPlaceholderText(t('common.eGJohnEmailCom'));
const passwordInput = () => screen.getByPlaceholderText(t('auth.eGMypassword123'));

describe('LoginForm', () => {
    it('envía el email y la contraseña cargados', async () => {
        const user = userEvent.setup();
        const { onSubmit } = renderForm();

        await user.type(emailInput(), 'ana@test.com');
        await user.type(passwordInput(), 'secreta1');
        await user.click(screen.getByRole('button', { name: t('auth.signIn2') }));

        expect(onSubmit).toHaveBeenCalledWith({ email: 'ana@test.com', password: 'secreta1' });
    });

    it('muestra el error y lo limpia cuando se vuelve a escribir', async () => {
        const user = userEvent.setup();
        const { onErrorClear } = renderForm({ error: 'Demasiados intentos' });

        expect(screen.getByText('Demasiados intentos')).toBeInTheDocument();

        await user.type(passwordInput(), 'x');

        expect(onErrorClear).toHaveBeenCalled();
    });

    it('permite ver la contraseña', async () => {
        const user = userEvent.setup();
        renderForm();

        expect(passwordInput()).toHaveAttribute('type', 'password');

        await user.click(screen.getByRole('button', { name: t('auth.showPassword') }));

        expect(passwordInput()).toHaveAttribute('type', 'text');
    });
});
