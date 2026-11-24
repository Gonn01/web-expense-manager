import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { acceptDialog, buttonNamed, closeDialog, currentDialog } from '@/test/ui-helpers';
import { t } from '@/i18n';
import ReversionCard from './ReversionCard';

const REVERSION = {
    movement_id: 70,
    gasto_name: 'Heladera',
    requester_name: 'Ana',
    amount: 100,
    currency_type: 'ARS',
    reversal_requested_at: '2026-11-01T12:00:00Z',
};

describe('ReversionCard', () => {
    afterEach(() => closeDialog());

    it('aceptar pide confirmación y recién entonces revierte', async () => {
        const user = userEvent.setup();
        const onAceptar = vi.fn().mockResolvedValue();
        render(
            <ReversionCard
                reversion={REVERSION}
                variant="porConfirmar"
                onAceptar={onAceptar}
                onRechazar={vi.fn()}
            />,
        );

        await user.click(buttonNamed('common.accept'));

        expect(currentDialog().confirmLabel).toBe(t('common.revert'));
        expect(onAceptar).not.toHaveBeenCalled();

        await acceptDialog();

        await waitFor(() => expect(onAceptar).toHaveBeenCalledWith(70));
    });

    it('descartar el diálogo no revierte', async () => {
        const user = userEvent.setup();
        const onAceptar = vi.fn();
        render(
            <ReversionCard
                reversion={REVERSION}
                variant="porConfirmar"
                onAceptar={onAceptar}
                onRechazar={vi.fn()}
            />,
        );

        await user.click(buttonNamed('common.accept'));
        closeDialog();

        expect(onAceptar).not.toHaveBeenCalled();
    });

    it('la contraparte puede rechazarla', async () => {
        const user = userEvent.setup();
        const onRechazar = vi.fn();
        render(
            <ReversionCard
                reversion={REVERSION}
                variant="porConfirmar"
                onAceptar={vi.fn()}
                onRechazar={onRechazar}
            />,
        );

        await user.click(buttonNamed('compartidos.reject'));

        expect(onRechazar).toHaveBeenCalledWith(70);
    });

    it('quien la pidió solo puede cancelarla', async () => {
        const user = userEvent.setup();
        const onCancelar = vi.fn();
        render(<ReversionCard reversion={REVERSION} variant="esperando" onCancelar={onCancelar} />);

        expect(screen.getAllByRole('button')).toHaveLength(1);

        await user.click(buttonNamed('common.cancelRequest'));

        expect(onCancelar).toHaveBeenCalledWith(70);
    });
});
