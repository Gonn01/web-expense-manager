import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    fetchCompartidos,
    aprobarCompartido,
    rechazarCompartido,
    reintentarCompartido,
    confirmarPago as confirmarPagoApi,
    rechazarPago as rechazarPagoApi,
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

    const load = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const data = await fetchCompartidos(token);
            const pagosData = data.pagos ?? { porConfirmar: [], esperando: [] };
            setCompartidos({ recibidos: data.recibidos, emitidos: data.emitidos });
            setPagos(pagosData);
            const pending = data.recibidos.filter((r) => r.status === 'PENDING_APPROVAL').length;
            setPendingCount(pending);
            setPendingPaymentsCount(pagosData.porConfirmar.length);
        } catch (err) {
            console.error('Error cargando compartidos', err);
        } finally {
            setLoading(false);
        }
    }, [token, setPendingCount, setPendingPaymentsCount]);

    useEffect(() => {
        load();
    }, [load]);

    const pusherEvents = useMemo(
        () => ({
            'compartido.nuevo': load,
            'compartido.aprobado': load,
            'compartido.rechazado': load,
            'pago.pendiente': load,
            'pago.confirmado': load,
            'pago.rechazado': load,
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
                // La entidad nueva la crea el backend al aprobar (vinculada al
                // emisor): se suma al store sin recargar el listado.
                const entityId = approved?.financial_entity_id;
                const { getEntityById, addEntity } = useEntitiesStore.getState();
                if (newEntityName && entityId && !getEntityById(entityId)) {
                    const gasto = compartidos.recibidos.find((r) => r.id === gastoId);
                    addEntity({
                        id: entityId,
                        name: newEntityName,
                        is_favorite: false,
                        linked_user_id: gasto?.sender_id ?? null,
                        linked_user_name: gasto?.sender_name ?? null,
                        linked_user_email: gasto?.sender_email ?? null,
                        cantidad: 1,
                        pending_count: 0,
                    });
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
                // El interceptor de axios ya mostró el error.
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
                // El interceptor de axios ya mostró el error.
                console.error('Error rechazando pago', err);
            } finally {
                setLoadingAction(null);
            }
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
    };
}
