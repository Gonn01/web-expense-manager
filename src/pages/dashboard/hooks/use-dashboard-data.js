import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    fetchDashboardData,
    createGasto,
    postergarGasto as postergarGastoApi,
    favoritoGasto as favoritoGastoApi,
    favoritoEntidad as favoritoEntidadApi,
} from '@/services/api';

import useAuth from '@/store/use-auth-store';
import { useSettlements } from '@/hooks/use-settlements';
import { usePusherChannel } from '@/hooks/use-pusher-channel';
import { useSettlementStore } from '@/store/use-settlement-store';
import { Currency, ExpenseStatus } from '@/utils/enums';
import { useEntitiesStore } from '@/store/use-entities-store';
import {
    addCreatedToGroups,
    buildDashboardGroups,
    changePendingCount,
    keepsGroupOnDashboard,
} from '../utils/dashboard-groups';

const getEntityById = (id) => useEntitiesStore.getState().getEntityById(id);

const CURRENCY_VALUES = Object.values(Currency);

export function useDashboardData() {
    const { token, user } = useAuth();
    const { handleConfirm } = useSettlements(token);

    const [loaded, setLoaded] = useState(false);
    const [groups, setGroups] = useState([]);
    const groupsRef = useRef(groups);
    const [pendingTotal, setPendingTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [busyKeys, setBusyKeys] = useState(() => new Set());

    const runBusy = useCallback(async (key, fn) => {
        setBusyKeys((prev) => new Set(prev).add(key));
        try {
            return await fn();
        } finally {
            setBusyKeys((prev) => {
                const next = new Set(prev);
                next.delete(key);
                return next;
            });
        }
    }, []);

    const patchGasto = useCallback((gastoId, patch) => {
        setGroups((prev) =>
            prev.map((g) => ({
                ...g,
                items: g.items.map((it) =>
                    String(it.id) === String(gastoId) ? { ...it, ...patch } : it,
                ),
            })),
        );
    }, []);

    const summaryByCurrency = useMemo(() => {
        if (!loaded) return null;
        const totals = Object.fromEntries(
            CURRENCY_VALUES.map((cur) => [
                cur,
                { egreso: 0, ingreso: 0, cuotaEgreso: 0, cuotaIngreso: 0 },
            ]),
        );

        groups.forEach((group) => {
            group.items.forEach((g) => {
                if (g.is_postponed) return;
                const curr = g.currency_type;
                const restante = g.amount - g.payed_quotas * g.amount_per_quota;
                const cuota = Number(g.amount_per_quota || 0);

                if (g.type === 'INGRESO') {
                    totals[curr].ingreso += restante;
                    totals[curr].cuotaIngreso += cuota;
                } else {
                    totals[curr].egreso += restante;
                    totals[curr].cuotaEgreso += cuota;
                }
            });
        });

        return CURRENCY_VALUES.reduce((acc, cur) => {
            acc[cur] = {
                total_egreso: totals[cur].egreso,
                total_ingreso: totals[cur].ingreso,
                total_balance: totals[cur].ingreso - totals[cur].egreso,
                cuota_egreso: totals[cur].cuotaEgreso,
                cuota_ingreso: totals[cur].cuotaIngreso,
                cuota_balance: totals[cur].cuotaIngreso - totals[cur].cuotaEgreso,
            };
            return acc;
        }, {});
    }, [groups, loaded]);

    useEffect(() => {
        groupsRef.current = groups;
    }, [groups]);

    const loadDashboard = useCallback(
        async ({ silent = false } = {}) => {
            if (!token) return;

            try {
                if (!silent) setLoading(true);
                const entities = await fetchDashboardData(token);

                setPendingTotal(
                    entities.reduce((sum, e) => sum + (Number(e.pending_count) || 0), 0),
                );

                setGroups(buildDashboardGroups(entities));
                setLoaded(true);
            } catch (err) {
                console.error('Error cargando dashboard:', err);
            } finally {
                if (!silent) setLoading(false);
            }
        },
        [token],
    );

    const reloadSilently = useCallback(() => loadDashboard({ silent: true }), [loadDashboard]);

    const updateAfterPayment = useCallback(
        (updatedItems) => {
            const updatedById = new Map(updatedItems.map((it) => [String(it.id), it]));

            const newGroups = groups
                .map((group) => {
                    const newItems = group.items
                        .map((it) => {
                            const server = updatedById.get(String(it.id));
                            if (!server) return it;

                            const updated = {
                                ...it,
                                ...server,
                                progress: server.fixed_expense
                                    ? 100
                                    : Math.min(
                                          (server.payed_quotas / server.number_of_quotas) * 100,
                                          100,
                                      ),
                            };

                            if (server.fixed_expense) return updated;

                            if (server.payed_quotas >= server.number_of_quotas) return null;

                            return updated;
                        })
                        .filter(Boolean);

                    return { ...group, items: newItems };
                })
                .filter(keepsGroupOnDashboard);

            setGroups(newGroups);
        },
        [groups],
    );

    const settleQuotas = useCallback(
        async (items) => {
            const updatedItems = await handleConfirm(items);
            updateAfterPayment(updatedItems);
            return updatedItems;
        },
        [handleConfirm, updateAfterPayment],
    );

    const crearGasto = useCallback(
        async (payload) => {
            const created = await createGasto(payload, token);
            const { mirror, ...gasto } = created;

            let next = addCreatedToGroups(groups, gasto, getEntityById);
            if (next && mirror) next = addCreatedToGroups(next, mirror, getEntityById);
            if (!next) {
                await loadDashboard({ silent: true });
                return created;
            }

            setGroups(next);
            if (gasto.status === ExpenseStatus.PENDING_APPROVAL) setPendingTotal((t) => t + 1);
            return created;
        },
        [token, groups, loadDashboard],
    );

    const postergarGasto = useCallback(
        (gastoId, postponed) =>
            runBusy(`postpone:${gastoId}`, async () => {
                const settlement = useSettlementStore.getState();
                if (postponed && settlement.session && settlement.isChecked(gastoId)) {
                    await settlement.toggleExpense({ id: gastoId });
                }

                try {
                    await postergarGastoApi(gastoId, postponed, token);
                    patchGasto(gastoId, { is_postponed: postponed });
                } catch (err) {
                    console.error('Error postergando gasto:', err);
                }
            }),
        [token, runBusy, patchGasto],
    );

    const favoritoGasto = useCallback(
        (gastoId, favorite) =>
            runBusy(`favGasto:${gastoId}`, async () => {
                try {
                    await favoritoGastoApi(gastoId, favorite, token);
                    patchGasto(gastoId, { is_favorite: favorite });
                } catch (err) {
                    console.error('Error marcando favorito:', err);
                }
            }),
        [token, runBusy, patchGasto],
    );

    const favoritoEntidad = useCallback(
        (entidadId, favorite) =>
            runBusy(`favEntidad:${entidadId}`, async () => {
                try {
                    await favoritoEntidadApi(entidadId, favorite, token);
                    setGroups((prev) =>
                        prev.map((g) =>
                            String(g.id) === String(entidadId)
                                ? { ...g, is_favorite: favorite }
                                : g,
                        ),
                    );
                } catch (err) {
                    console.error('Error marcando favorito de entidad:', err);
                }
            }),
        [token, runBusy],
    );

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    const onCompartidoRespondido = useCallback(
        ({ entityId } = {}) => {
            if (entityId != null) {
                setGroups((prev) => changePendingCount(prev, entityId, -1));
                setPendingTotal((t) => Math.max(0, t - 1));
            }
            reloadSilently();
        },
        [reloadSilently],
    );

    const onPagoPendiente = useCallback(
        ({ copyId } = {}) => {
            const tieneLaCopia =
                copyId != null &&
                groupsRef.current.some((g) =>
                    g.items.some((it) => String(it.id) === String(copyId)),
                );
            if (!tieneLaCopia) {
                reloadSilently();
                return;
            }
            setGroups((prev) =>
                prev.map((g) => ({
                    ...g,
                    items: g.items.map((it) =>
                        String(it.id) === String(copyId)
                            ? {
                                  ...it,
                                  counterparty_pending_quotas:
                                      (Number(it.counterparty_pending_quotas) || 0) + 1,
                              }
                            : it,
                    ),
                })),
            );
        },
        [reloadSilently],
    );

    const pusherEvents = useMemo(
        () => ({
            'compartido.aprobado': onCompartidoRespondido,
            'compartido.rechazado': onCompartidoRespondido,
            'compartido.descartado': reloadSilently,
            'pago.pendiente': onPagoPendiente,
            'pago.confirmado': reloadSilently,
            'pago.rechazado': reloadSilently,
            'pago.retirado': reloadSilently,
            'pago.reversion_aceptada': reloadSilently,
            'edicion.aprobada': reloadSilently,
        }),
        [onCompartidoRespondido, onPagoPendiente, reloadSilently],
    );

    usePusherChannel(user?.id ? `compartidos-${user.id}` : null, pusherEvents);

    return {
        groups,
        setGroups,
        pendingTotal,
        summaryByCurrency,
        loadDashboard,
        getSummaryForCurrency: (currency) => summaryByCurrency?.[currency] ?? null,
        settleQuotas,
        crearGasto,
        postergarGasto,
        favoritoGasto,
        favoritoEntidad,
        busyKeys,
        loading,
    };
}
