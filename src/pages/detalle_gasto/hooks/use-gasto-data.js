import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '@/store/use-auth-store';
import {
    settleQuota as settleQuotaApi,
    revertirPago as revertirPagoApi,
    cancelarReversion as cancelarReversionApi,
    fetchGastoById,
    updateGasto,
    deleteGasto,
    compartirGasto,
    solicitarEdicionCompartida,
    cancelarEdicionCompartida,
} from '@/services/api';
import { sharedEditChanges } from '@/utils/shared-edit';
import { pendingResponsesForGasto } from '@/utils/pending-responses';
import { isSettlementActive } from '@/hooks/use-settlements';
import { useCompartidos } from '@/hooks/use-compartidos';
import { usePusherChannel } from '@/hooks/use-pusher-channel';
import { useSettlementStore } from '@/store/use-settlement-store';
import { useSnackbarStore } from '@/store/use-snackbar-store';
import { t } from '@/i18n';

export function useGastoData() {
    const { id } = useParams();
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [gasto, setGasto] = useState(null);
    const [loading, setLoading] = useState(false);
    const shared = useCompartidos();
    const pendingResponses = pendingResponsesForGasto(shared, gasto);

    useEffect(() => {
        load();
    }, [id, token]);

    const sharedRef = useRef(false);

    useEffect(() => {
        sharedRef.current = Boolean(gasto?.was_shared);
    }, [gasto]);

    const pusherEvents = useMemo(() => {
        const refreshIfShared = async () => {
            if (!sharedRef.current) return;
            try {
                setGasto(await fetchGastoById(id, token));
            } catch (err) {
                console.error('Error actualizando gasto', err);
            }
        };
        return {
            'compartido.nuevo': refreshIfShared,
            'compartido.aprobado': refreshIfShared,
            'compartido.rechazado': refreshIfShared,
            'compartido.desvinculado': refreshIfShared,
            'pago.pendiente': refreshIfShared,
            'pago.confirmado': refreshIfShared,
            'pago.rechazado': refreshIfShared,
            'pago.retirado': refreshIfShared,
            'pago.reversion_solicitada': refreshIfShared,
            'pago.reversion_cancelada': refreshIfShared,
            'pago.reversion_aceptada': refreshIfShared,
            'pago.reversion_rechazada': refreshIfShared,
            'edicion.solicitada': refreshIfShared,
            'edicion.aprobada': refreshIfShared,
            'edicion.rechazada': refreshIfShared,
            'edicion.cancelada': refreshIfShared,
        };
    }, [id, token]);

    usePusherChannel(user?.id ? `notificaciones-${user.id}` : null, pusherEvents);

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
        const vigente = await fetchGastoById(gasto.id, token);
        const changes = vigente.shared_edit_locks ? sharedEditChanges(gasto, payload) : null;
        if (!changes) {
            const updated = await updateGasto(gasto.id, payload, token);
            setGasto(updated);
            return;
        }
        await solicitarEdicionCompartida(gasto.id, changes, token);
        const { image_url, category_ids } = payload;
        const updated = await updateGasto(gasto.id, { image_url, category_ids }, token);
        setGasto(updated);
        const otra = gasto.shared_counterparty?.name ?? t('people.otherPerson');
        useSnackbarStore
            .getState()
            .show(t('detail.editRequestSent', { name: otra }), 'success', 'pending_actions');
    }

    async function cancelarEdicion() {
        const request = gasto?.pending_edit_request;
        if (!request) return;
        try {
            await cancelarEdicionCompartida(request.id, token);
            await load(true);
            useSnackbarStore.getState().show(t('detalleGasto.editRequestCancelled'), 'success');
        } catch (err) {
            console.error('Error cancelando la edición', err);
        }
    }

    async function transferir(entityId, entityName) {
        if (!gasto) return;
        const updated = await updateGasto(gasto.id, { financial_entity_id: entityId }, token);
        setGasto(updated);
        useSnackbarStore
            .getState()
            .show(t('detail.transferred', { name: entityName }), 'success', 'swap_horiz');
    }

    async function compartir() {
        if (!gasto) return;
        try {
            const updated = await compartirGasto(gasto.id, token);
            setGasto(updated);
            useSettlementStore.getState().applyUnmarked([gasto.id]);
            const destinatario = gasto.share_target_name ?? t('people.otherPerson');
            useSnackbarStore
                .getState()
                .show(t('detalleGasto.expenseShared', { name: destinatario }), 'success', 'group');
        } catch (err) {
            console.error('Error compartiendo gasto', err);
        }
    }

    async function settleQuota() {
        if (!gasto) return;
        const deferred = isSettlementActive();
        try {
            const updated = await settleQuotaApi(gasto.id, token);
            if (deferred) useSettlementStore.getState().applyMarked([gasto.id]);
            setGasto(updated);
            useSnackbarStore
                .getState()
                .show(
                    deferred
                        ? t('common.expenseMarkedItSRecordedWhenYou')
                        : t('common.paymentRecordedInTheExpenseHistory'),
                    'success',
                    deferred ? 'playlist_add_check' : 'check_circle',
                );
        } catch (err) {
            console.error('Error registrando pago', err);
        }
    }

    async function revertirPago(movement) {
        if (!gasto || !movement) return;
        const mensajes = {
            revertido: t('detalleGasto.paymentRevertedInTheExpenseHistory'),
            retirado: t('detalleGasto.paymentWithdrawnTheInstallmentIsUnpaidAgain'),
            solicitada: t('detalleGasto.weAskedTheOtherPersonToConfirm'),
        };
        try {
            const { resultado, gasto: updated } = await revertirPagoApi(
                gasto.id,
                movement.id,
                token,
            );
            setGasto(updated);
            useSnackbarStore.getState().show(mensajes[resultado], 'success', 'undo');
        } catch (err) {
            console.error('Error revirtiendo pago', err);
        }
    }

    async function cancelarReversion(movement) {
        if (!gasto || !movement) return;
        try {
            await cancelarReversionApi(movement.id, token);
            await load(true);
            useSnackbarStore.getState().show(t('detalleGasto.reversalRequestCancelled'), 'success');
        } catch (err) {
            console.error('Error cancelando la reversión', err);
        }
    }

    async function eliminar(deleteLinked = false) {
        if (!gasto) return false;
        try {
            await deleteGasto(gasto.id, token, { deleteLinked });
            return true;
        } catch {
            return false;
        }
    }

    return {
        gasto,
        actualizar,
        transferir,
        compartir,
        settleQuota,
        revertirPago,
        cancelarReversion,
        cancelarEdicion,
        eliminar,
        load,
        loading,
        shared,
        pendingResponses,
    };
}
