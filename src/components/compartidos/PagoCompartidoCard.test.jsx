import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSettlementStore } from '@/store/use-settlement-store';
import { acceptDialog, buttonNamed, closeDialog, currentDialog } from '@/test/ui-helpers';
import { t } from '@/i18n';
import PagoCompartidoCard from './PagoCompartidoCard';

const PAGO = {
    movement_id: 50,
    sibling_purchase_id: 30,
    gasto_name: 'Heladera',
    amount: 100,
    currency_type: 'ARS',
    number_of_quotas: 3,
    payed_quotas: 1,
    counterparty_name: 'Beto',
    created_at: '2026-11-01T12:00:00Z',
};

describe('PagoCompartidoCard', () => {
    afterEach(() => {
        closeDialog();
        useSettlementStore.setState({ checkedExpenses: {} });
    });

    it('la contraparte confirma o rechaza el pago', async () => {
        const user = userEvent.setup();
        const onConfirmar = vi.fn();
        const onRechazar = vi.fn();
        render(
            <PagoCompartidoCard
                pago={PAGO}
                variant="porConfirmar"
                onConfirmar={onConfirmar}
                onRechazar={onRechazar}
            />,
        );

        await user.click(buttonNamed('common.confirm'));
        await user.click(buttonNamed('compartidos.reject'));

        expect(onConfirmar).toHaveBeenCalledWith(50);
        expect(onRechazar).toHaveBeenCalledWith(50);
    });

    it('avisa si el pago está marcado en la sesión de cuentas', () => {
        useSettlementStore.setState({ checkedExpenses: { 30: true } });

        render(
            <PagoCompartidoCard
                pago={PAGO}
                variant="porConfirmar"
                onConfirmar={vi.fn()}
                onRechazar={vi.fn()}
            />,
        );

        expect(
            screen.getByText(t('compartidos.markedInYourSettlementSession')),
        ).toBeInTheDocument();
    });

    it('retirar el pago pide confirmación antes de ejecutarse', async () => {
        const user = userEvent.setup();
        const onRetirar = vi.fn().mockResolvedValue();
        render(<PagoCompartidoCard pago={PAGO} variant="esperando" onRetirar={onRetirar} />);

        await user.click(buttonNamed('compartidos.withdrawPayment'));

        expect(currentDialog().tone).toBe('danger');
        expect(onRetirar).not.toHaveBeenCalled();

        await acceptDialog();

        await waitFor(() => expect(onRetirar).toHaveBeenCalledWith(50));
    });

    it('quien espera no puede confirmar su propio pago', () => {
        render(<PagoCompartidoCard pago={PAGO} variant="esperando" onRetirar={vi.fn()} />);

        expect(
            screen.queryByRole('button', { name: new RegExp(`${t('common.confirm')}$`) }),
        ).not.toBeInTheDocument();
    });
});
