import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntidadData } from './use-entidad-data';

export function useEntidadUI() {
    const navigate = useNavigate();

    const {
        entity,
        stats,
        loading,
        crearGastoEntidad,
        actualizarEntidad,
        actualizarAliasMercadoPago,
        eliminarEntidad,
        vincularUsuario,
        desvincularUsuario,
        settleQuota,
        gastosEliminados,
        restaurarGasto,
        shared,
        pendingResponses,
        reloadSilently,
    } = useEntidadData();

    const [tab, setTab] = useState('activos');
    const [restoringIds, setRestoringIds] = useState(new Set());

    const onRestaurarGasto = useCallback(
        async (gastoId) => {
            setRestoringIds((prev) => new Set([...prev, gastoId]));
            try {
                await restaurarGasto(gastoId);
            } finally {
                setRestoringIds((prev) => {
                    const nextSet = new Set(prev);
                    nextSet.delete(gastoId);
                    return nextSet;
                });
            }
        },
        [restaurarGasto],
    );
    const [openNewExpense, setOpenNewExpense] = useState(false);
    const [openEditEntity, setOpenEditEntity] = useState(false);
    const [loadingCreatingExpense, setLoadingCreatingExpense] = useState(false);
    const [loadingUpdatingEntity, setLoadingUpdatingEntity] = useState(false);
    const [loadingVincular, setLoadingVincular] = useState(false);
    const [openMercadoPagoAlias, setOpenMercadoPagoAlias] = useState(false);
    const [savingMercadoPagoAlias, setSavingMercadoPagoAlias] = useState(false);

    const [settleModalOpen, setSettleModalOpen] = useState(false);
    const [settleModalItem, setPayModalItem] = useState(null);
    const [loadingSettleIds, setLoadingPayIds] = useState(new Set());

    function openSettleModal(gasto) {
        setPayModalItem(gasto);
        setSettleModalOpen(true);
    }

    async function onConfirmSettle() {
        if (!settleModalItem) return;
        setLoadingPayIds((prev) => new Set([...prev, settleModalItem.id]));

        try {
            await settleQuota(settleModalItem);
        } finally {
            setLoadingPayIds((prev) => {
                const next = new Set(prev);
                next.delete(settleModalItem.id);
                return next;
            });
            setSettleModalOpen(false);
            setPayModalItem(null);
        }
    }

    async function onCreateExpense(payload) {
        setLoadingCreatingExpense(true);
        try {
            await crearGastoEntidad(payload);
            setOpenNewExpense(false);
        } catch (err) {
            console.error('Error creando gasto', err);
        } finally {
            setLoadingCreatingExpense(false);
        }
    }

    async function onUpdateEntity(newName) {
        setLoadingUpdatingEntity(true);
        try {
            await actualizarEntidad(newName);
            setOpenEditEntity(false);
        } finally {
            setLoadingUpdatingEntity(false);
        }
    }

    async function onSaveMercadoPagoAlias(alias) {
        setSavingMercadoPagoAlias(true);
        try {
            await actualizarAliasMercadoPago(alias);
            setOpenMercadoPagoAlias(false);
        } catch (err) {
            console.error('Error guardando alias de Mercado Pago', err);
        } finally {
            setSavingMercadoPagoAlias(false);
        }
    }

    async function onDeleteEntity() {
        await eliminarEntidad();
        navigate('/app/entidades');
    }

    async function onVincular(email) {
        setLoadingVincular(true);
        try {
            await vincularUsuario(email);
        } finally {
            setLoadingVincular(false);
        }
    }

    async function onDesvincular() {
        setLoadingVincular(true);
        try {
            await desvincularUsuario();
        } finally {
            setLoadingVincular(false);
        }
    }

    return {
        entity,
        stats,
        loading,

        tab,
        setTab,

        openNewExpense,
        setOpenNewExpense,
        openEditEntity,
        setOpenEditEntity,

        onCreateExpense,
        loadingCreatingExpense,

        onUpdateEntity,
        loadingUpdatingEntity,

        openMercadoPagoAlias,
        setOpenMercadoPagoAlias,
        onSaveMercadoPagoAlias,
        savingMercadoPagoAlias,

        onVincular,
        onDesvincular,
        loadingVincular,

        onDeleteEntity,

        settleModalOpen,
        settleModalItem,
        openSettleModal,
        onConfirmSettle,
        setSettleModalOpen,
        loadingSettleIds,

        gastosEliminados,
        onRestaurarGasto,
        restoringIds,

        shared,
        pendingResponses,
        reloadSilently,

        navigate,
    };
}
