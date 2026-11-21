import { t } from '@/i18n';

export const SHARED_ENTITY_TRANSFER_REASON = t('common.thisEntityIsLinkedToAnotherUser');

export function transferBlockReason(gasto, entities) {
    if (!gasto) return null;
    const lock = gasto.edit_locks?.financial_entity_id;
    if (lock) return lock;
    const current = entities.find((e) => e.id == gasto.financial_entity_id);
    if (current?.linked_user_id) return SHARED_ENTITY_TRANSFER_REASON;
    return null;
}

export function transferTargets(gasto, entities) {
    return entities.filter(
        (e) =>
            e.id != gasto.financial_entity_id &&
            e.id != gasto.linked_financial_entity_id &&
            !e.linked_user_id,
    );
}
