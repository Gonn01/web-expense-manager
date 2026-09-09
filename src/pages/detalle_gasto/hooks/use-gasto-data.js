import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '@/store/use-auth-store';
import {
    pagarCuota as pagarCuota2,
    refundCuota as refundCuota2,
    fetchGastoById,
    updateGasto,
    deleteGasto,
} from '@/services/api';
import { isReconcileActive } from '@/hooks/use-payments';
import { useReconcileStore } from '@/store/use-reconcile-store';
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
        await updateGasto(gasto.id, payload, token);
        await load(true);
    }

    // En el detalle de gasto se puede pagar/revertir SIN sesión de "hacer
    // cuentas": con sesión abierta el pago queda diferido (se registra al
    // cerrarla); sin sesión se registra ahora, solo en el historial del gasto.
    async function pagarCuota() {
        if (!gasto) return;
        const deferred = isReconcileActive();
        try {
            await pagarCuota2(gasto.id, token);
            if (deferred) useReconcileStore.getState().refreshAfterPayment();
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
            // El interceptor de axios ya mostró el mensaje según el código.
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
            // El interceptor de axios ya mostró el mensaje según el código.
            console.error('Error revirtiendo cuota', err);
        }
    }

    async function eliminar(deleteLinked = false) {
        if (!gasto) return;
        setLoading(true);
        await deleteGasto(gasto.id, token, { deleteLinked });
        setLoading(false);
    }

    return {
        gasto,
        actualizar,
        pagarCuota,
        refundCuota,
        eliminar,
        load,
        loading,
    };
}
