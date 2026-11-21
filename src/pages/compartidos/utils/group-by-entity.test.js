import { describe, expect, it } from 'vitest';

import { t } from '@/i18n';
import {
    edicionGroup,
    emitidoGroup,
    groupByEntity,
    pagoGroup,
    recibidoGroup,
    reversionGroup,
} from '@/pages/compartidos/utils/group-by-entity';

const entities = [
    { id: 1, name: 'Banco', linked_user_id: null },
    { id: 2, name: 'Ana', linked_user_id: 20 },
    { id: 3, name: 'Beto', linked_user_id: 30 },
];

describe('emitidoGroup', () => {
    it('agrupa por la entidad del gasto aunque el id venga como texto', () => {
        expect(emitidoGroup({ financial_entity_id: '1' }, entities)).toEqual({
            key: 'entity-1',
            name: 'Banco',
            isPerson: false,
        });
    });

    it('usa el nombre recibido si la entidad ya no está en la lista', () => {
        const group = emitidoGroup({ financial_entity_id: 9, entity_name: 'Vieja' }, entities);

        expect(group).toEqual({ key: 'entity-9', name: 'Vieja', isPerson: false });
    });

    it('sin entidad agrupa por quien recibe', () => {
        const group = emitidoGroup({ financial_entity_id: null, receiver_name: 'Eva' }, entities);

        expect(group).toEqual({ key: 'person-Eva', name: 'Eva', isPerson: true });
    });
});

describe('recibidoGroup', () => {
    it('prioriza la entidad asignada sobre la sugerida y la vinculada', () => {
        const item = { assigned_entity_id: 1, suggested_entity_id: 3, sender_id: 20 };

        expect(recibidoGroup(item, entities).name).toBe('Banco');
    });

    it('usa la sugerida si no hay asignada', () => {
        const item = { assigned_entity_id: null, suggested_entity_id: 3, sender_id: 20 };

        expect(recibidoGroup(item, entities).name).toBe('Beto');
    });

    it('usa la entidad vinculada a quien envió', () => {
        expect(recibidoGroup({ sender_id: 20 }, entities).name).toBe('Ana');
    });

    it('sin datos usa el texto de sin entidad', () => {
        expect(recibidoGroup({}, entities)).toEqual({
            key: 'person--',
            name: t('common.noEntity'),
            isPerson: true,
        });
    });
});

describe('grupos según quién actuó', () => {
    it('un pago propio se agrupa por la contraparte', () => {
        const pago = {
            created_by_user_id: 10,
            counterparty_user_id: 20,
            counterparty_name: 'Ana P.',
            registrar_name: 'Yo',
        };

        expect(pagoGroup(pago, entities, '10').name).toBe('Ana');
    });

    it('un pago ajeno se agrupa por quien lo registró', () => {
        const pago = {
            created_by_user_id: 30,
            counterparty_user_id: 10,
            counterparty_name: 'Yo',
            registrar_name: 'Beto R.',
        };

        expect(pagoGroup(pago, entities, 10).name).toBe('Beto');
    });

    it('un pago sin entidad vinculada se agrupa por persona', () => {
        const pago = {
            created_by_user_id: 40,
            counterparty_user_id: 10,
            counterparty_name: 'Yo',
            registrar_name: 'Dani',
        };

        expect(pagoGroup(pago, entities, 10)).toEqual({
            key: 'person-Dani',
            name: 'Dani',
            isPerson: true,
        });
    });

    it('una reversión se agrupa por la otra persona', () => {
        const propia = { owner_user_id: 10, counterparty_user_id: 20, owner_name: 'Yo' };
        const ajena = { owner_user_id: 30, counterparty_user_id: 10, owner_name: 'Beto' };

        expect(reversionGroup(propia, entities, 10).name).toBe('Ana');
        expect(reversionGroup(ajena, entities, 10).name).toBe('Beto');
    });

    it('una edición se agrupa por la otra persona', () => {
        const propia = { requested_by_user_id: 10, counterparty_user_id: 20 };
        const ajena = { requested_by_user_id: 30, counterparty_user_id: 10 };

        expect(edicionGroup(propia, entities, 10).name).toBe('Ana');
        expect(edicionGroup(ajena, entities, 10).name).toBe('Beto');
    });
});

describe('groupByEntity', () => {
    it('junta los ítems por clave y ordena por nombre', () => {
        const a = { id: 'a', group: { key: 'entity-3', name: 'Zeta', isPerson: false } };
        const b = { id: 'b', group: { key: 'entity-1', name: 'Álamo', isPerson: false } };
        const c = { id: 'c', group: { key: 'entity-3', name: 'Zeta', isPerson: false } };

        const groups = groupByEntity([a, b, c]);

        expect(groups.map((g) => g.name)).toEqual(['Álamo', 'Zeta']);
        expect(groups[1].items).toEqual([a, c]);
    });

    it('devuelve una lista vacía sin ítems', () => {
        expect(groupByEntity([])).toEqual([]);
    });
});
