import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { buttonNamed } from '@/test/ui-helpers';
import RecibidoCard from './RecibidoCard';

const ITEM = {
    id: 30,
    name: 'Cena',
    amount: 300,
    currency_type: 'ARS',
    number_of_quotas: 3,
    status: 'PENDING_APPROVAL',
    created_at: '2026-11-01T12:00:00Z',
};

describe('RecibidoCard', () => {
    it('aprueba con el gasto completo y rechaza con su id', async () => {
        const user = userEvent.setup();
        const onAprobar = vi.fn();
        const onRechazar = vi.fn();
        render(<RecibidoCard item={ITEM} onAprobar={onAprobar} onRechazar={onRechazar} />);

        await user.click(buttonNamed('compartidos.approve'));
        await user.click(buttonNamed('compartidos.reject'));

        expect(onAprobar).toHaveBeenCalledWith(ITEM);
        expect(onRechazar).toHaveBeenCalledWith(30);
    });

    it('bloquea las acciones mientras una está en curso', () => {
        render(
            <RecibidoCard
                item={ITEM}
                onAprobar={vi.fn()}
                onRechazar={vi.fn()}
                loading={{ kind: 'aprobar' }}
            />,
        );

        for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled();
    });

    it.each(['ACTIVE', 'REJECTED'])('no ofrece acciones en estado %s', (status) => {
        render(
            <RecibidoCard item={{ ...ITEM, status }} onAprobar={vi.fn()} onRechazar={vi.fn()} />,
        );

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
});
