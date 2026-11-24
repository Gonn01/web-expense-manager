import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEntitiesStore } from '@/store/use-entities-store';
import { buttonNamed } from '@/test/ui-helpers';
import { t } from '@/i18n';
import AprobarModal from './AprobarModal';

const GASTO = {
    id: 30,
    name: 'Cena',
    amount: 300,
    currency_type: 'ARS',
    sender_name: 'Ana',
    suggested_entity_id: 7,
};

const ENTITIES = [
    { id: 7, name: 'Banco' },
    { id: 8, name: 'Billetera' },
];

const renderModal = (props = {}) => {
    const onConfirm = vi.fn();
    render(<AprobarModal open gasto={GASTO} onClose={vi.fn()} onConfirm={onConfirm} {...props} />);
    return onConfirm;
};

describe('AprobarModal', () => {
    beforeEach(() => {
        useEntitiesStore.setState({ entities: ENTITIES, loading: false, loadEntities: vi.fn() });
    });

    it('no se muestra cerrado', () => {
        renderModal({ open: false });

        expect(screen.queryByText(t('compartidos.approveSharedExpense'))).not.toBeInTheDocument();
    });

    it('aprueba en la entidad sugerida', async () => {
        const user = userEvent.setup();
        const onConfirm = renderModal();

        await user.click(buttonNamed('compartidos.approve'));

        expect(onConfirm).toHaveBeenCalledWith(7, null);
    });

    it('exige un nombre para crear una entidad nueva', async () => {
        const user = userEvent.setup();
        const onConfirm = renderModal();

        await user.click(buttonNamed('compartidos.createNew'));

        expect(buttonNamed('compartidos.approve')).toBeDisabled();

        await user.type(screen.getByLabelText(t('compartidos.entityName')), '  Con Ana  ');
        await user.click(buttonNamed('compartidos.approve'));

        expect(onConfirm).toHaveBeenCalledWith(null, 'Con Ana');
    });

    it('sin entidades propone el nombre de quien envió el gasto', async () => {
        useEntitiesStore.setState({ entities: [] });
        const user = userEvent.setup();
        const onConfirm = renderModal({ gasto: { ...GASTO, suggested_entity_id: null } });

        expect(screen.getByLabelText(t('compartidos.entityName'))).toHaveValue('Ana');

        await user.click(buttonNamed('compartidos.approve'));

        expect(onConfirm).toHaveBeenCalledWith(null, 'Ana');
    });

    it('no permite aprobar dos veces mientras guarda', () => {
        renderModal({ loading: true });

        expect(buttonNamed('compartidos.approve')).toBeDisabled();
    });
});
