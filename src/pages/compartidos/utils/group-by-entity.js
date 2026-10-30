function entityLinkedTo(entities, userId) {
    if (userId == null) return null;
    return entities.find((e) => String(e.linked_user_id) === String(userId)) ?? null;
}

function entityById(entities, id) {
    if (id == null) return null;
    return entities.find((e) => String(e.id) === String(id)) ?? null;
}

function groupFor(entity, personName, fallbackEntity) {
    const named = entity ?? (fallbackEntity?.id != null ? fallbackEntity : null);
    if (named) return { key: `entity-${named.id}`, name: named.name, isPerson: false };
    return {
        key: `person-${personName ?? '-'}`,
        name: personName ?? 'Sin entidad',
        isPerson: true,
    };
}

export function emitidoGroup(item, entities) {
    return groupFor(entityById(entities, item.financial_entity_id), item.receiver_name, {
        id: item.financial_entity_id,
        name: item.entity_name,
    });
}

export function recibidoGroup(item, entities) {
    const entity =
        entityById(entities, item.assigned_entity_id) ??
        entityById(entities, item.suggested_entity_id) ??
        entityLinkedTo(entities, item.sender_id);
    return groupFor(entity, item.sender_name);
}

export function pagoGroup(pago, entities, userId) {
    const iRegistered = String(pago.created_by_user_id) === String(userId);
    const otherUserId = iRegistered ? pago.counterparty_user_id : pago.created_by_user_id;
    const otherName = iRegistered ? pago.counterparty_name : pago.registrar_name;
    return groupFor(entityLinkedTo(entities, otherUserId), otherName);
}

export function groupByEntity(items) {
    const groups = new Map();
    for (const item of items) {
        const group = groups.get(item.group.key) ?? { ...item.group, items: [] };
        group.items.push(item);
        groups.set(item.group.key, group);
    }
    return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'));
}
