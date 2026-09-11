import { useEffect, useState, useCallback, useMemo } from 'react';
import {
    fetchFinancialEntityById,
    createGasto,
    updateFinancialEntity,
    deleteFinancialEntity,
    vincularUsuarioEntidad,
    desvincularUsuarioEntidad,
    fetchGastosEliminados,
    restaurarGasto as restaurarGastoApi,
    pagarCuota as pagarCuotaApi,
} from '@/services/api';
import useAuth from '@/store/use-auth-store';
import { useSnackbarStore } from '@/store/use-snackbar-store';
import { useParams } from 'react-router-dom';

export function useEntidadData() {
    const { id } = useParams();
    const { token } = useAuth();

    const [entity, setEntity] = useState(null);
    const [loading, setLoading] = useState(true);

    // Gastos eliminados de la entidad (soft-delete). Se cargan on-demand
    // cuando el usuario abre la pestaña "Eliminados".
    const [gastosEliminados, setGastosEliminados] = useState(null); // null = nunca cargado
    const [loadingEliminados, setLoadingEliminados] = useState(false);

    useEffect(() => {
        if (!token) return;

        const load = async () => {
            try {
                setLoading(true);
                const data = await fetchFinancialEntityById(id, token);
                setEntity(data);
            } catch (err) {
                console.error('Error cargando entidad', err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id, token]);

    const stats = useMemo(() => {
        if (!entity) return { amount: 0, debts: 0, fixed: 0, finalized: 0, pending: 0 };

        let totalAmount = 0;
        let fixedCount = 0;

        const sumar = (g) => {
            const amount = Number(g.amount || 0);

            if (g.fixed_expense) fixedCount += 1;

            totalAmount += amount;
        };

        entity.gastos_activos.forEach(sumar);
        entity.gastos_inactivos.forEach(sumar);
        entity.gastos_fijos?.forEach(sumar);

        return {
            amount: totalAmount,
            debts: entity.gastos_activos.length,
            fixed: fixedCount,
            finalized: entity.gastos_inactivos.length,
            pending: entity.gastos_pendientes?.length ?? 0,
        };
    }, [entity]);

    const crearGastoEntidad = useCallback(
        async (payload) => {
            const nuevo = await createGasto(payload, token);
            const isFixed = nuevo.fixed_expense === true;
            const paid = Number(nuevo.payed_quotas || 0);
            const total = Number(nuevo.number_of_quotas || 0);

            setEntity((prev) => {
                // Gasto creado en una entidad vinculada: queda pendiente de aprobación.
                if (nuevo.status === 'PENDING_APPROVAL') {
                    return {
                        ...prev,
                        gastos_pendientes: [...(prev.gastos_pendientes ?? []), nuevo],
                    };
                }

                if (isFixed) {
                    return {
                        ...prev,
                        gastos_activos: [...prev.gastos_activos, nuevo],
                    };
                }

                if (total > 0) {
                    const isFinished = paid >= total;

                    return {
                        ...prev,
                        gastos_activos: isFinished
                            ? prev.gastos_activos
                            : [...prev.gastos_activos, nuevo],

                        gastos_inactivos: isFinished
                            ? [...prev.gastos_inactivos, nuevo]
                            : prev.gastos_inactivos,
                    };
                }

                return {
                    ...prev,
                    gastos_activos: [...prev.gastos_activos, nuevo],
                };
            });

            return nuevo;
        },
        [token],
    );

    const actualizarEntidad = useCallback(
        async (newName) => {
            const data = await updateFinancialEntity(id, newName, token);
            setEntity((prev) =>
                prev
                    ? { ...prev, name: data.name, movements: data.movements ?? prev.movements }
                    : prev,
            );
        },
        [id, token],
    );

    const eliminarEntidad = useCallback(async () => {
        await deleteFinancialEntity(id, token);
    }, [id, token]);

    const cargarGastosEliminados = useCallback(async () => {
        setLoadingEliminados(true);
        try {
            const data = await fetchGastosEliminados(id, token);
            setGastosEliminados(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error cargando gastos eliminados', err);
            setGastosEliminados((prev) => prev ?? []);
        } finally {
            setLoadingEliminados(false);
        }
    }, [id, token]);

    const restaurarGasto = useCallback(
        async (gastoId) => {
            const restored = await restaurarGastoApi(gastoId, token);
            // Sale de la lista de eliminados y vuelve a activos, sin recargar
            // toda la entidad.
            setGastosEliminados((prev) => (prev ?? []).filter((g) => g.id !== gastoId));
            setEntity((prev) =>
                prev ? { ...prev, gastos_activos: [restored, ...prev.gastos_activos] } : prev,
            );
        },
        [token],
    );

    const vincularUsuario = useCallback(
        async (email) => {
            const updated = await vincularUsuarioEntidad(id, email, token);
            setEntity((prev) => ({
                ...prev,
                linked_user_id: updated.linked_user_id,
                linked_user_name: updated.linked_user_name,
                linked_user_email: updated.linked_user_email,
            }));
        },
        [id, token],
    );

    const desvincularUsuario = useCallback(async () => {
        await desvincularUsuarioEntidad(id, token);
        setEntity((prev) => ({
            ...prev,
            linked_user_id: null,
            linked_user_name: null,
            linked_user_email: null,
        }));
    }, [id, token]);

    // El "modo hacer cuentas" vive solo en el dashboard: desde el detalle de
    // entidad el pago es SIEMPRE directo (aunque haya una sesión abierta). Si el
    // gasto estaba postergado, el backend le quita la postergación al pagar.
    const pagarCuota = useCallback(
        async (gasto) => {
            try {
                const updated = await pagarCuotaApi(gasto.id, token, { direct: true });
                const isFinished =
                    !updated.fixed_expense &&
                    Number(updated.payed_quotas) >= Number(updated.number_of_quotas);

                setEntity((prev) => {
                    if (!prev) return prev;
                    let movedToInactive = false;
                    const activos = prev.gastos_activos.reduce((acc, g) => {
                        if (g.id !== updated.id) {
                            acc.push(g);
                        } else if (!isFinished) {
                            acc.push(updated);
                        } else {
                            movedToInactive = true;
                        }
                        return acc;
                    }, []);
                    return {
                        ...prev,
                        gastos_activos: activos,
                        gastos_inactivos: movedToInactive
                            ? [updated, ...prev.gastos_inactivos]
                            : prev.gastos_inactivos,
                    };
                });

                useSnackbarStore
                    .getState()
                    .show('Pago registrado en el historial del gasto.', 'success', 'check_circle');
            } catch (err) {
                // El interceptor de axios ya mostró el mensaje según el código.
                console.error('Error registrando pago', err);
            }
        },
        [token],
    );

    return {
        entity,
        stats,
        loading,
        crearGastoEntidad,
        actualizarEntidad,
        eliminarEntidad,
        vincularUsuario,
        desvincularUsuario,
        pagarCuota,
        setEntity,
        gastosEliminados,
        loadingEliminados,
        cargarGastosEliminados,
        restaurarGasto,
    };
}
