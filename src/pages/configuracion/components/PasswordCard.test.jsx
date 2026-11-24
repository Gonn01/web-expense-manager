import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { t } from '@/i18n';
import { PasswordCard } from './PasswordCard';

const field = (key) => screen.getByLabelText(t(`configuracion.${key}`));
const submit = (key) => screen.getByRole('button', { name: t(`configuracion.${key}`) });

describe('PasswordCard', () => {
    it('no se muestra hasta saber si la cuenta tiene contraseña', () => {
        const { container } = render(<PasswordCard hasPassword={null} onSave={vi.fn()} />);

        expect(container).toBeEmptyDOMElement();
    });

    it('exige la contraseña actual si la cuenta ya tiene una', async () => {
        const user = userEvent.setup();
        const onSave = vi.fn();
        render(<PasswordCard hasPassword onSave={onSave} />);

        await user.type(field('passwordNew'), 'nueva123');
        await user.type(field('passwordConfirm'), 'nueva123');
        await user.click(submit('passwordChangeAction'));

        expect(screen.getByRole('alert')).toHaveTextContent(
            t('configuracion.passwordCurrentRequired'),
        );
        expect(onSave).not.toHaveBeenCalled();
    });

    it('rechaza una confirmación distinta', async () => {
        const user = userEvent.setup();
        const onSave = vi.fn();
        render(<PasswordCard hasPassword={false} onSave={onSave} />);

        await user.type(field('passwordNew'), 'nueva123');
        await user.type(field('passwordConfirm'), 'otra1234');
        await user.click(submit('passwordDefineAction'));

        expect(screen.getByRole('alert')).toHaveTextContent(t('configuracion.passwordMismatch'));
        expect(onSave).not.toHaveBeenCalled();
    });

    it('guarda y limpia el formulario', async () => {
        const user = userEvent.setup();
        const onSave = vi.fn().mockResolvedValue(true);
        render(<PasswordCard hasPassword onSave={onSave} />);

        await user.type(field('passwordCurrent'), 'actual1');
        await user.type(field('passwordNew'), 'nueva123');
        await user.type(field('passwordConfirm'), 'nueva123');
        await user.click(submit('passwordChangeAction'));

        expect(onSave).toHaveBeenCalledWith({
            currentPassword: 'actual1',
            newPassword: 'nueva123',
        });
        expect(field('passwordNew')).toHaveValue('');
    });

    it('conserva lo escrito si no se pudo guardar', async () => {
        const user = userEvent.setup();
        const onSave = vi.fn().mockResolvedValue(false);
        render(<PasswordCard hasPassword={false} onSave={onSave} />);

        await user.type(field('passwordNew'), 'nueva123');
        await user.type(field('passwordConfirm'), 'nueva123');
        await user.click(submit('passwordDefineAction'));

        expect(field('passwordNew')).toHaveValue('nueva123');
    });
});
