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
        eliminarEntidad,
        vincularUsuario,
        desvincularUsuario,
        settleQuota,
        gastosEliminados,
        restaurarGasto,
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

    // Payment modal
    const [settleModalOpen, setSettleModalOpen] = useState(false);
    const [settleModalItem, setPayModalItem] = useState(null);
    const [loadingSettleIds, setLoadingPayIds] = useState(new Set());

    function openSettleModal(gasto) {
        setPayModalItem(gasto);
        setSettleModalOpen(true);
    }

    async function onConfirmSettle() {
        if (!settleModalItem) return;
        setSettleModalOpen(false);
        setLoadingPayIds((prev) => new Set([...prev, settleModalItem.id]));

        await settleQuota(settleModalItem);

        setLoadingPayIds((prev) => {
            const next = new Set(prev);
            next.delete(settleModalItem.id);
            return next;
        });
        setPayModalItem(null);
    }

    async function onCreateExpense(payload) {
        setLoadingCreatingExpense(true);
        await crearGastoEntidad(payload);
        setLoadingCreatingExpense(false);
        setOpenNewExpense(false);
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

        navigate,
    };
}
