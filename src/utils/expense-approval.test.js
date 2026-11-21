import { describe, expect, it } from 'vitest';
import { isAwaitingApproval, paidQuotasStayPending } from './expense-approval';

describe('isAwaitingApproval', () => {
    it('un gasto compartido que la otra persona no aprobó espera aprobación', () => {
        expect(isAwaitingApproval({ status: 'PENDING_APPROVAL' })).toBe(true);
    });

    it('un gasto activo, rechazado o sin datos no espera aprobación', () => {
        expect(isAwaitingApproval({ status: 'ACTIVE' })).toBe(false);
        expect(isAwaitingApproval({ status: 'REJECTED' })).toBe(false);
        expect(isAwaitingApproval(null)).toBe(false);
    });
});

describe('paidQuotasStayPending', () => {
    it('en una entidad vinculada, las cuotas marcadas como pagadas quedan pendientes', () => {
        expect(paidQuotasStayPending({ id: 7, linked_user_id: 2 }, 2)).toBe(true);
    });

    it('sin cuotas pagadas no hay nada pendiente', () => {
        expect(paidQuotasStayPending({ id: 7, linked_user_id: 2 }, 0)).toBe(false);
    });

    it('en una entidad sin vínculo las cuotas pagadas cuentan como pagadas', () => {
        expect(paidQuotasStayPending({ id: 7, linked_user_id: null }, 2)).toBe(false);
        expect(paidQuotasStayPending(undefined, 2)).toBe(false);
    });
});
