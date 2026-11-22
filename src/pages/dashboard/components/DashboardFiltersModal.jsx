import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/Icon';
import { Currency } from '@/utils/enums';
import { t } from '@/i18n';

const EMPTY_FILTERS = { currency: null, typeFilter: null, fixedFilter: null };

export default function DashboardFiltersModal({ groups, filters, onApply, onClose }) {
    const [draft, setDraft] = useState(filters);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', onKey);
        };
    }, [onClose]);

    const items = groups.flatMap((g) => g.items);
    const countWhere = (predicate) => items.filter(predicate).length;
    const updateDraft = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }));

    const currencyOptions = [
        { value: null, label: t('dashboard.allCount', { count: items.length }) },
        ...Object.values(Currency)
            .map((cur) => ({ cur, count: countWhere((it) => it.currency_type === cur) }))
            .filter(({ cur, count }) => count > 0 || draft.currency === cur)
            .map(({ cur, count }) => ({ value: cur, label: `${cur} (${count})` })),
    ];
    const typeOptions = [
        { value: null, label: t('dashboard.all') },
        { value: 'EGRESO', label: t('common.expense') },
        { value: 'INGRESO', label: t('common.income') },
    ];
    const frequencyOptions = [
        { value: null, label: `${t('dashboard.all')} (${items.length})` },
        {
            value: true,
            label: `${t('dashboard.fixed')} (${countWhere((it) => it.fixed_expense === true)})`,
        },
        {
            value: false,
            label: `${t('dashboard.variable')} (${countWhere((it) => it.fixed_expense === false)})`,
        },
    ];

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="dashboard-filters-title"
                className="flex flex-col w-full max-w-lg max-h-full overflow-hidden bg-white dark:bg-[#18211b] rounded-xl border border-slate-300 dark:border-[#3d5245] shadow-xl"
            >
                <div className="flex items-center justify-between gap-3 p-4 sm:px-6 border-b border-slate-200 dark:border-[#3d5245]">
                    <h2
                        id="dashboard-filters-title"
                        className="text-slate-900 dark:text-white text-xl font-bold tracking-tight"
                    >
                        {t('dashboard.filters')}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t('common.close')}
                        className="cursor-pointer text-slate-500 dark:text-[#9eb7a8] transition-colors hover:text-slate-900 dark:hover:text-white"
                    >
                        <Icon name="close" />
                    </button>
                </div>

                <div className="flex flex-col gap-5 p-4 sm:p-6 overflow-y-auto">
                    <FilterSection
                        label={t('common.currency')}
                        options={currencyOptions}
                        selected={draft.currency}
                        onSelect={(value) => updateDraft('currency', value)}
                    />
                    <FilterSection
                        label={t('dashboard.type')}
                        options={typeOptions}
                        selected={draft.typeFilter}
                        onSelect={(value) => updateDraft('typeFilter', value)}
                    />
                    <FilterSection
                        label={t('dashboard.frequency')}
                        options={frequencyOptions}
                        selected={draft.fixedFilter}
                        onSelect={(value) => updateDraft('fixedFilter', value)}
                    />
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 p-4 sm:px-6 bg-slate-50/60 dark:bg-[#1c2620]/60 border-t border-slate-300 dark:border-[#3d5245]">
                    <button
                        type="button"
                        onClick={() => setDraft(EMPTY_FILTERS)}
                        className="cursor-pointer w-full sm:w-auto h-11 px-5 rounded-lg bg-slate-100 dark:bg-[#29382f] text-slate-900 dark:text-white text-sm font-bold transition-colors hover:bg-slate-200 dark:hover:bg-[#34453a]"
                    >
                        {t('common.clear')}
                    </button>
                    <button
                        type="button"
                        onClick={() => onApply(draft)}
                        className="cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto h-11 px-5 rounded-lg bg-primary text-[#111714] text-sm font-bold transition-opacity hover:opacity-80"
                    >
                        <Icon name="filter_alt" />
                        {t('dashboard.applyFilters')}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}

function FilterSection({ label, options, selected, onSelect }) {
    return (
        <fieldset className="flex flex-col gap-2">
            <legend className="pb-2 text-sm font-medium text-slate-900 dark:text-white">
                {label}
            </legend>
            <div className="flex flex-wrap gap-2">
                {options.map(({ value, label: optionLabel }) => (
                    <button
                        key={String(value)}
                        type="button"
                        aria-pressed={selected === value}
                        onClick={() => onSelect(value)}
                        className={`px-3 py-2 rounded-lg border text-sm font-semibold transition-colors cursor-pointer ${
                            selected === value
                                ? 'border-primary bg-primary/15 text-slate-900 dark:text-white'
                                : 'border-slate-300 dark:border-[#3d5245] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                        }`}
                    >
                        {optionLabel}
                    </button>
                ))}
            </div>
        </fieldset>
    );
}
