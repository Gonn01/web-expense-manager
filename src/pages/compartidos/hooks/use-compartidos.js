import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    fetchCompartidos,
    aprobarCompartido,
    rechazarCompartido,
    reintentarCompartido,
    confirmarPago as confirmarPagoApi,
    rechazarPago as rechazarPagoApi,
    createGasto,
} from '@/services/api';
import useAuth from '@/store/use-auth-store';
import { useCompartidosStore } from '@/store/use-compartidos-store';
import { useEntitiesStore } from '@/store/use-entities-store';
import { useSnackbarStore } from '@/store/use-snackbar-store';
import { usePusherChannel } from '@/hooks/use-pusher-channel';

export function useCompartidos() {
    const { token, user } = useAuth();
    const { setPendingCount, setPendingPaymentsCount } = useCompartidosStore();

    const [compartidos, setCompartidos] = useState({ recibidos: [], emitidos: [] });
    const [pagos, setPagos] = useState({ porConfirmar: [], esperando: [] });
    const [loading, setLoading] = useState(true);
    const [loadingAction, setLoadingAction] = useState(null);

    const load = useCallback(
        async ({ silent = false } = {}) => {
            if (!token) return;
            try {
                if (!silent) setLoading(true);
                const data = await fetchCompartidos(token);
                const pagosData = data.pagos ?? { porConfirmar: [], esperando: [] };
                setCompartidos({ recibidos: data.recibidos, emitidos: data.emitidos });
                setPagos(pagosData);
                const pending = data.recibidos.filter(
                    (r) => r.status === 'PENDING_APPROVAL',
                ).length;
                setPendingCount(pending);
                setPendingPaymentsCount(pagosData.porConfirmar.length);
            } catch (err) {
                console.error('Error cargando compartidos', err);
            } finally {
                if (!silent) setLoading(false);
            }
        },
        [token, setPendingCount, setPendingPaymentsCount],
    );

    useEffect(() => {
        load();
    }, [load]);

    const pusherEvents = useMemo(
        () => ({
            'compartido.nuevo': () => load(),
            'compartido.aprobado': () => load(),
            'compartido.rechazado': () => load(),
            'pago.pendiente': () => load(),
            'pago.confirmado': () => load(),
            'pago.rechazado': () => load(),
        }),
        [load],
    );

    usePusherChannel(user?.id ? `compartidos-${user.id}` : null, pusherEvents);

    const aprobar = useCallback(
        async (gastoId, financialEntityId, newEntityName) => {
            setLoadingAction(gastoId);
            try {
                const approved = await aprobarCompartido(
                    gastoId,
                    {
                        financial_entity_id: financialEntityId ?? null,
                        new_entity_name: newEntityName ?? null,
                    },
                    token,
                );
                const entityId = approved?.financial_entity_id;
                const gasto = compartidos.recibidos.find((r) => r.id === gastoId);
                const senderLink = {
                    linked_user_id: gasto?.sender_id ?? null,
                    linked_user_name: gasto?.sender_name ?? null,
                    linked_user_email: gasto?.sender_email ?? null,
                };
                const { entities, getEntityById, addEntity, updateEntity } =
                    useEntitiesStore.getState();
                const existing = entityId ? getEntityById(entityId) : null;
                if (newEntityName && entityId && !existing) {
                    addEntity({
                        id: entityId,
                        name: newEntityName,
                        is_favorite: false,
                        ...senderLink,
                        cantidad: 1,
                        pending_count: 0,
                    });
                } else if (
                    existing &&
                    !existing.linked_user_id &&
                    senderLink.linked_user_id != null &&
                    !entities.some(
                        (e) => String(e.linked_user_id) === String(senderLink.linked_user_id),
                    )
                ) {
                    updateEntity(entityId, senderLink);
                }
                await load();
            } finally {
                setLoadingAction(null);
            }
        },
        [token, load, compartidos.recibidos],
    );

    const rechazar = useCallback(
        async (gastoId) => {
            setLoadingAction(gastoId);
            try {
                await rechazarCompartido(gastoId, token);
                setCompartidos((prev) => ({
                    ...prev,
                    recibidos: prev.recibidos.map((r) =>
                        r.id === gastoId ? { ...r, status: 'REJECTED' } : r,
                    ),
                }));
                setPendingCount((c) => Math.max(0, c - 1));
            } finally {
                setLoadingAction(null);
            }
        },
        [token, setPendingCount],
    );

    const reintentar = useCallback(
        async (gastoId) => {
            setLoadingAction(gastoId);
            try {
                await reintentarCompartido(gastoId, token);
                await load();
            } finally {
                setLoadingAction(null);
            }
        },
        [token, load],
    );

    const confirmarPago = useCallback(
        async (movementId) => {
            setLoadingAction(movementId);
            try {
                await confirmarPagoApi(movementId, token);
                useSnackbarStore.getState().show('Pago confirmado', 'success');
                await load();
            } catch (err) {
                console.error('Error confirmando pago', err);
            } finally {
                setLoadingAction(null);
            }
        },
        [token, load],
    );

    const rechazarPago = useCallback(
        async (movementId) => {
            setLoadingAction(movementId);
            try {
                await rechazarPagoApi(movementId, token);
                useSnackbarStore.getState().show('Pago rechazado', 'success');
                await load();
            } catch (err) {
                console.error('Error rechazando pago', err);
            } finally {
                setLoadingAction(null);
            }
        },
        [token, load],
    );

    const crearGasto = useCallback(
        async (payload) => {
            await createGasto(payload, token);
            await load({ silent: true });
        },
        [token, load],
    );

    return {
        compartidos,
        pagos,
        loading,
        loadingAction,
        aprobar,
        rechazar,
        reintentar,
        confirmarPago,
        rechazarPago,
        crearGasto,
    };
}
