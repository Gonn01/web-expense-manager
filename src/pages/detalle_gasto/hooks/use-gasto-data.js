import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '@/store/use-auth-store';
import {
    settleQuota as settleQuotaApi,
    refundCuota as refundCuota2,
    fetchGastoById,
    updateGasto,
    deleteGasto,
} from '@/services/api';
import { isSettlementActive } from '@/hooks/use-settlements';
import { useSettlementStore } from '@/store/use-settlement-store';
import { useSnackbarStore } from '@/store/use-snackbar-store';

export function useGastoData() {
    const { id } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();
    const [gasto, setGasto] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        load();
    }, [id, token]);

    async function load(silent = false) {
        try {
            if (!silent) setLoading(true);
            const res = await fetchGastoById(id, token);
            setGasto(res);
        } catch (err) {
            console.error('Error cargando gasto', err);
            navigate(`/app/entidades/${gasto.entidad}`);
        } finally {
            if (!silent) setLoading(false);
        }
    }

    async function actualizar(payload) {
        if (!gasto) return;
        const updated = await updateGasto(gasto.id, payload, token);
        setGasto(updated);
    }

    async function transferir(entityId, entityName) {
        if (!gasto) return;
        const updated = await updateGasto(gasto.id, { financial_entity_id: entityId }, token);
        setGasto(updated);
        useSnackbarStore
            .getState()
            .show(`Gasto transferido a "${entityName}".`, 'success', 'swap_horiz');
    }

    async function settleQuota() {
        if (!gasto) return;
        const deferred = isSettlementActive();
        try {
            await settleQuotaApi(gasto.id, token);
            if (deferred) useSettlementStore.getState().applyMarked([gasto.id]);
            await load(true);
            useSnackbarStore
                .getState()
                .show(
                    deferred
                        ? 'Gasto marcado. Se registra al terminar las cuentas.'
                        : 'Pago registrado en el historial del gasto.',
                    'success',
                    deferred ? 'playlist_add_check' : 'check_circle',
                );
        } catch (err) {
            console.error('Error registrando pago', err);
        }
    }

    async function refundCuota() {
        if (!gasto) return;
        try {
            await refundCuota2(gasto.id, token);
            await load(true);
            useSnackbarStore
                .getState()
                .show('Pago revertido en el historial del gasto.', 'success', 'undo');
        } catch (err) {
            console.error('Error revirtiendo cuota', err);
        }
    }

    async function eliminar(deleteLinked = false) {
        if (!gasto) return false;
        setLoading(true);
        try {
            await deleteGasto(gasto.id, token, { deleteLinked });
            return true;
        } catch {
            return false;
        } finally {
            setLoading(false);
        }
    }

    return {
        gasto,
        actualizar,
        transferir,
        settleQuota,
        refundCuota,
        eliminar,
        load,
        loading,
    };
}
