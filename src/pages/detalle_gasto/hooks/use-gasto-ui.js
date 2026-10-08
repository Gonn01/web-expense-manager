import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGastoData } from './use-gasto-data';

export function useGastoUI() {
    const nav = useNavigate();

    const { gasto, setGasto, actualizar, settleQuota, refundCuota, eliminar, loading } = useGastoData();

    const totalPagado = useMemo(() => {
        if (!gasto) return 0;
        return gasto.payed_quotas * gasto.amount_per_quota;
    }, [gasto]);

    const porcentaje = useMemo(() => {
        return gasto?.fixed_expense ? 100 : gasto ? (totalPagado / gasto.amount) * 100 : 0;
    }, [gasto, totalPagado]);

    const volverALista = () => {
        if (!gasto) return;
        nav(`/app/entidades/${gasto.financial_entity_id}`);
    };

    const onSeleccionAdjuntos = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const nuevos = files.map((f) => ({
            name: f.name,
            url: URL.createObjectURL(f),
        }));

        setGasto((prev) => ({ ...prev, adjuntos: [...prev.adjuntos, ...nuevos] }));
    };

    return {
        gasto,
        totalPagado,
        porcentaje,
        loading,
        actualizar,
        settleQuota,
        refundCuota,
        eliminar,
        onSeleccionAdjuntos,
        volverALista,
    };
}
