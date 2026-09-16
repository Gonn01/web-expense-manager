import { useCallback, useMemo, useState } from 'react';
import useAuth from '@/store/use-auth-store';
import { useReconcileStore } from '@/store/use-reconcile-store';
import { Currency } from '@/utils/enums';

const CURRENCY_VALUES = Object.values(Currency);

export function useDashboardUI(groups = [], pagarCuotas) {
    const { user } = useAuth();

    const [currency, setCurrency] = useState(null);
    const [query, setQuery] = useState('');
    const [openNewExpense, setOpenNewExpense] = useState(false);
    const [loadingCreatingExpense, setLoadingCreatingExpense] = useState(false);
    const [typeFilter, setTypeFilter] = useState(null);
    const [fixedFilter, setFixedFilter] = useState(null);
    const [loadingPayIds, setLoadingPayIds] = useState(new Set());

    const reconcileActive = useReconcileStore((s) => s.active);

    const preferredCurrency = (() => {
        const pref = user?.preferred_currency;
        return CURRENCY_VALUES.includes(pref) ? pref : Currency.ARS;
    })();

    const filteredGroups = useMemo(() => {
        const q = query.trim().toLowerCase();
        const sinFiltros = !q && currency === null && typeFilter === null && fixedFilter === null;

        return groups
            .map((g) => {
                const matchEntityName = q ? g.name.toLowerCase().includes(q) : false;

                const items = g.items.filter((it) => {
                    const matchTitle = q
                        ? matchEntityName || it.name.toLowerCase().includes(q)
                        : true;
                    const matchCurrency = currency === null || it.currency_type === currency;
                    const matchType = typeFilter === null || it.type === typeFilter;
                    const matchFixed = fixedFilter === null || it.fixed_expense === fixedFilter;

                    // Los postergados se siguen mostrando aunque haya una sesión de
                    // cuentas activa: si desaparecieran de la lista no habría forma
                    // de revertir la postergación sin esperar a que termine la sesión.
                    return matchTitle && matchCurrency && matchType && matchFixed;
                });

                return { ...g, items };
            })
            .filter((g) => g.items.length > 0 || (g.is_favorite && sinFiltros && !reconcileActive));
    }, [groups, currency, query, typeFilter, fixedFilter, reconcileActive]);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalEntity, setModalEntity] = useState('');
    const [modalItems, setModalItems] = useState([]);

    const openGroup = useCallback((group) => {
        setModalEntity(group.name);
        setModalItems(group.items);
        setModalOpen(true);
    }, []);

    const openItem = useCallback((group, item) => {
        setModalEntity(group.name);
        setModalItems([item]);
        setModalOpen(true);
    }, []);

    const payModal = {
        modalOpen,
        modalItems,
        modalEntity,
        setModalOpen,
        openGroup,
        openItem,
    };

    async function onConfirmPay(itemsOverride) {
        payModal.setModalOpen(false);

        const itemsToPay =
            Array.isArray(itemsOverride) && itemsOverride.length
                ? itemsOverride
                : payModal.modalItems;
        const ids = itemsToPay.map((i) => i.id);
        setLoadingPayIds((prev) => new Set([...prev, ...ids]));

        await pagarCuotas(itemsToPay);

        setLoadingPayIds(new Set());
    }

    return {
        currency,
        setCurrency,
        preferredCurrency,
        query,
        setQuery,
        openNewExpense,
        setOpenNewExpense,
        loadingCreatingExpense,
        setLoadingCreatingExpense,

        typeFilter,
        setTypeFilter,
        fixedFilter,
        setFixedFilter,
        filteredGroups,

        payModal,
        loadingPayIds,
        onConfirmPay,
    };
}
