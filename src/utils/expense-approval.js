import { ExpenseStatus } from '@/utils/enums';

export const isAwaitingApproval = (gasto) => gasto?.status === ExpenseStatus.PENDING_APPROVAL;

export const paidQuotasStayPending = (entity, paidQuotas) =>
    Boolean(entity?.linked_user_id) && Number(paidQuotas) > 0;
