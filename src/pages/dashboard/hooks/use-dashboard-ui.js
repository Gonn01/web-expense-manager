import { useCallback, useMemo, useState } from 'react';
import useAuth from '@/store/use-auth-store';
import { useSettlementStore } from '@/store/use-settlement-store';
import { useDialogStore } from '@/store/use-dialog-store';
import { Currency } from '@/utils/enums';
import { filterDashboardGroups } from '../utils/dashboard-groups';
import { t } from '@/i18n';

const CURRENCY_VALUES = Object.values(Currency);

export function useDashboardUI(groups = [], settleQuotas, postergarGasto) {
    const { user } = useAuth();

    const [currency, setCurrency] = useState(null);
    const [query, setQuery] = useState('');
    const [openNewExpense, setOpenNewExpense] = useState(false);
    const [loadingCreatingExpense, setLoadingCreatingExpense] = useState(false);
    const [typeFilter, setTypeFilter] = useState(null);
    const [fixedFilter, setFixedFilter] = useState(null);
    const [loadingSettleIds, setLoadingPayIds] = useState(new Set());

    const settlementActive = useSettlementStore((s) => s.active);

    const preferredCurrency = (() => {
        const pref = user?.preferred_currency;
        return CURRENCY_VALUES.includes(pref) ? pref : Currency.ARS;
    })();

    const filteredGroups = useMemo(
        () =>
            filterDashboardGroups(groups, {
                query,
                currency,
                typeFilter,
                fixedFilter,
                settlementActive,
            }),
        [groups, currency, query, typeFilter, fixedFilter, settlementActive],
    );

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

    const settleModal = {
        modalOpen,
        modalItems,
        modalEntity,
        setModalOpen,
        openGroup,
        openItem,
    };

    async function onConfirmSettle(itemsOverride) {
        settleModal.setModalOpen(false);

        const itemsToPay =
            Array.isArray(itemsOverride) && itemsOverride.length
                ? itemsOverride
                : settleModal.modalItems;
        const ids = itemsToPay.map((i) => i.id);
        setLoadingPayIds((prev) => new Set([...prev, ...ids]));

        await settleQuotas(itemsToPay);

        setLoadingPayIds(new Set());
    }

    const requestTogglePostpone = useCallback(
        (gastoId, postponed) => {
            const gasto = groups.flatMap((g) => g.items).find((it) => it.id === gastoId);
            const nombre = gasto?.name ? `"${gasto.name}"` : t('dashboard.theExpense');
            const marcado = useSettlementStore.getState().isChecked?.(gastoId);

            return useDialogStore.getState().confirm({
                title: postponed
                    ? t('dashboard.postponeExpense')
                    : t('dashboard.reactivateExpense'),
                message: postponed
                    ? t('dashboard.postponeMessage', { name: nombre }) +
                      (marcado ? t('dashboard.postponeMarkedNote') : '')
                    : t('dashboard.reactivateMessage', { name: nombre }),
                tone: 'info',
                confirmLabel: postponed ? t('common.postpone') : t('common.reactivate'),
                onConfirm: () => postergarGasto(gastoId, postponed),
            });
        },
        [groups, postergarGasto],
    );

    return {
        requestTogglePostpone,
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

        settleModal,
        loadingSettleIds,
        onConfirmSettle,
    };
}
