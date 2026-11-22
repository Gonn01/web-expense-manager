import { describe, expect, it } from 'vitest';
import {
    CompartidoAction,
    applyCompartidoAction,
    compartidosCounters,
} from './compartidos-actions';

const estado = () => ({
    compartidos: {
        recibidos: [
            { id: 30, status: 'PENDING_APPROVAL' },
            { id: 31, status: 'PENDING_APPROVAL' },
        ],
        emitidos: [
            { id: 20, copy_status: 'REJECTED' },
            { id: 21, copy_status: 'PENDING_APPROVAL' },
        ],
    },
    pagos: {
        porConfirmar: [{ movement_id: 500 }, { movement_id: 501 }],
        esperando: [{ movement_id: 600 }],
    },
    reversiones: { porConfirmar: [{ movement_id: 700 }], esperando: [{ movement_id: 800 }] },
    ediciones: { porConfirmar: [{ id: 9 }], esperando: [{ id: 10 }] },
});

describe('applyCompartidoAction', () => {
    it('aprobar quita solo la tarjeta aprobada y deja el resto igual', () => {
        const antes = estado();
        const despues = applyCompartidoAction(antes, CompartidoAction.APROBAR, 30);

        expect(despues.compartidos.recibidos.map((r) => r.id)).toEqual([31]);
        expect(despues.compartidos.emitidos).toBe(antes.compartidos.emitidos);
        expect(despues.pagos).toBe(antes.pagos);
    });

    it('rechazar deja la tarjeta como rechazada', () => {
        const despues = applyCompartidoAction(estado(), CompartidoAction.RECHAZAR, 31);

        expect(despues.compartidos.recibidos.find((r) => r.id === 31).status).toBe('REJECTED');
    });

    it('reintentar vuelve el enviado a pendiente y descartar lo quita', () => {
        const reintentado = applyCompartidoAction(estado(), CompartidoAction.REINTENTAR, 20);
        expect(reintentado.compartidos.emitidos[0].copy_status).toBe('PENDING_APPROVAL');

        const descartado = applyCompartidoAction(estado(), CompartidoAction.DESCARTAR, 20);
        expect(descartado.compartidos.emitidos.map((e) => e.id)).toEqual([21]);
    });

    it('confirmar o rechazar un pago lo quita de por confirmar; retirar, de esperando', () => {
        expect(
            applyCompartidoAction(estado(), CompartidoAction.CONFIRMAR_PAGO, 500).pagos
                .porConfirmar,
        ).toEqual([{ movement_id: 501 }]);
        expect(
            applyCompartidoAction(estado(), CompartidoAction.RECHAZAR_PAGO, 501).pagos.porConfirmar,
        ).toEqual([{ movement_id: 500 }]);
        expect(
            applyCompartidoAction(estado(), CompartidoAction.RETIRAR_PAGO, 600).pagos.esperando,
        ).toEqual([]);
    });

    it('responder o cancelar una reversión o una edición quita su tarjeta', () => {
        expect(
            applyCompartidoAction(estado(), CompartidoAction.ACEPTAR_REVERSION, 700).reversiones
                .porConfirmar,
        ).toEqual([]);
        expect(
            applyCompartidoAction(estado(), CompartidoAction.CANCELAR_REVERSION, 800).reversiones
                .esperando,
        ).toEqual([]);
        expect(
            applyCompartidoAction(estado(), CompartidoAction.APROBAR_EDICION, 9).ediciones
                .porConfirmar,
        ).toEqual([]);
        expect(
            applyCompartidoAction(estado(), CompartidoAction.CANCELAR_EDICION, 10).ediciones
                .esperando,
        ).toEqual([]);
    });
});

describe('compartidosCounters', () => {
    it('baja el contador de gastos al aprobar o rechazar un recibido', () => {
        expect(compartidosCounters(estado()).gastos).toBe(3);
        const aprobado = applyCompartidoAction(estado(), CompartidoAction.APROBAR, 30);
        expect(compartidosCounters(aprobado).gastos).toBe(2);
        const rechazado = applyCompartidoAction(aprobado, CompartidoAction.RECHAZAR, 31);
        expect(compartidosCounters(rechazado).gastos).toBe(1);
    });

    it('baja el contador de pagos al responder un pago, una reversión o una edición', () => {
        expect(compartidosCounters(estado()).pagos).toBe(4);
        const despues = [
            [CompartidoAction.CONFIRMAR_PAGO, 500],
            [CompartidoAction.RECHAZAR_REVERSION, 700],
            [CompartidoAction.RECHAZAR_EDICION, 9],
        ].reduce((s, [kind, id]) => applyCompartidoAction(s, kind, id), estado());
        expect(compartidosCounters(despues).pagos).toBe(1);
    });
});
