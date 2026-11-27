import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { t } from '@/i18n';
import VerificationNotice from './VerificationNotice';

describe('VerificationNotice', () => {
    it('explica a qué email se mandó el enlace y permite reenviarlo', async () => {
        const user = userEvent.setup();
        const onResend = vi.fn();
        render(<VerificationNotice email="ana@test.com" onResend={onResend} />);

        expect(
            screen.getByText(t('auth.verifyEmailMessage', { email: 'ana@test.com' })),
        ).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: t('auth.resendVerification') }));

        expect(onResend).toHaveBeenCalledTimes(1);
    });

    it('deshabilita el botón mientras reenvía', () => {
        render(<VerificationNotice email="ana@test.com" resending onResend={vi.fn()} />);

        expect(
            screen.getByRole('button', { name: new RegExp(t('auth.resendVerification')) }),
        ).toBeDisabled();
    });

    it('muestra el resultado en lugar del botón', () => {
        const message = t('auth.verificationResent', { email: 'ana@test.com' });
        render(<VerificationNotice email="ana@test.com" message={message} onResend={vi.fn()} />);

        expect(screen.getByText(message)).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: t('auth.resendVerification') }),
        ).not.toBeInTheDocument();
    });
});
