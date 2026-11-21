import { describe, expect, it } from 'vitest';
import { deleteExpenseNotice } from './delete-expense-notice';

describe('deleteExpenseNotice', () => {
    it('un gasto que nunca se compartió se puede restaurar', () => {
        expect(deleteExpenseNotice({ was_shared: false }).key).toBe(
            'detalleGasto.deleteRestorableHint',
        );
    });

    it('advierte con el nombre de la otra persona si está compartido y activo', () => {
        expect(
            deleteExpenseNotice({
                was_shared: true,
                shared_partner_name: 'Beto',
                status: 'ACTIVE',
            }),
        ).toEqual({ key: 'detalleGasto.deleteSharedWarning', params: { name: 'Beto' } });
    });

    it.each(['PENDING_APPROVAL', 'REJECTED'])('avisa que retira el pedido si está %s', (status) => {
        expect(
            deleteExpenseNotice({ was_shared: true, shared_partner_name: 'Beto', status }).key,
        ).toBe('detalleGasto.deleteUnacceptedWarning');
    });

    it('un gasto que dejó de ser compartido tampoco se puede restaurar', () => {
        expect(deleteExpenseNotice({ was_shared: true, shared_partner_name: null }).key).toBe(
            'detalleGasto.deleteFormerlySharedWarning',
        );
    });
});
