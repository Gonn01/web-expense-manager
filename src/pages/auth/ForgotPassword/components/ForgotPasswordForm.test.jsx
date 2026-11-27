import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { t } from '@/i18n';
import ForgotPasswordForm from './ForgotPasswordForm';

const renderForm = (props = {}) => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    const onErrorClear = vi.fn();
    render(
        <ForgotPasswordForm
            loading={false}
            onSubmit={onSubmit}
            onErrorClear={onErrorClear}
            {...props}
        />,
    );
    return { onSubmit, onErrorClear };
};

const emailInput = () => screen.getByPlaceholderText(t('common.eGJohnEmailCom'));

describe('ForgotPasswordForm', () => {
    it('envía el email cargado', async () => {
        const user = userEvent.setup();
        const { onSubmit } = renderForm();

        await user.type(emailInput(), 'ana@test.com');
        await user.click(screen.getByRole('button', { name: t('auth.forgotPasswordSubmit') }));

        expect(onSubmit).toHaveBeenCalledWith({ email: 'ana@test.com' });
    });

    it('muestra el error y lo limpia cuando se vuelve a escribir', async () => {
        const user = userEvent.setup();
        const { onErrorClear } = renderForm({ error: t('auth.invalidEmail') });

        expect(screen.getByText(t('auth.invalidEmail'))).toBeInTheDocument();

        await user.type(emailInput(), 'a');

        expect(onErrorClear).toHaveBeenCalled();
    });
});
