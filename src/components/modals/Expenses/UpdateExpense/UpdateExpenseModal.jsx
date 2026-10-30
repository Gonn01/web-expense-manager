import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import useAuth from '@/store/use-auth-store';
import { useEntitiesStore } from '@/store/use-entities-store';
import Icon from '@/components/Icon';
import TextInput from '@/components/TextInput';
import ExpenseTypeSelector from '../components/ExpenseTypeSelector';
import EntitySelector from '../components/EntitySelector';
import ExpenseAmountSection from '../components/ExpenseAmountSection';
import ExpenseInstallmentsSection from '../components/ExpenseInstallmentsSection';
import CategorySelector from '../components/CategorySelector';
import ExpenseModeSelector from '../components/ExpenseModeSelector';
import LockedField, { LockReason } from '../components/LockedField';
import { useCategoriesStore } from '@/store/use-categories-store';
import ExpenseFormErrors from '../components/ExpenseFormErrors';
import { validateExpenseForm, focusFirstError, exceedsMaxInstallments } from '../validate-expense';

export default function UpdateExpenseModal({ gasto, onClose, onSave }) {
    const { token } = useAuth();
    const { entities, createEntity } = useEntitiesStore();

    const containerRef = useRef(null);

    const [type, setType] = useState(gasto.type);
    const [name, setName] = useState(gasto.name);
    const [entity, setEntity] = useState(gasto.financial_entity_id);

    const [amount, setAmount] = useState(String(gasto.amount));
    const [currency, setCurrency] = useState(gasto.currency_type);

    const locks = gasto.edit_locks ?? {};
    const paidLock =
        locks.payed_quotas ?? 'Los pagos se registran con Pagar y se deshacen con Revertir.';

    const [isFixed, setIsFixed] = useState(Boolean(gasto.fixed_expense));
    const [isInstallment, setIsInstallment] = useState(
        !gasto.fixed_expense && gasto.number_of_quotas > 1,
    );

    const [installments, setInstallments] = useState(
        gasto.number_of_quotas > 1 ? String(gasto.number_of_quotas) : '',
    );

    const paidQuotas = Number(gasto.payed_quotas) || 0;
    const committedQuotas = paidQuotas + (Number(gasto.pending_quotas) || 0);
    const hasPayments = committedQuotas > 0;

    const [saving, setSaving] = useState(false);
    const [showNewEntity, setShowNewEntity] = useState(false);
    const [newEntityName, setNewEntityName] = useState('');
    const [linkedPrompt, setLinkedPrompt] = useState(false);
    const [pendingPayload, setPendingPayload] = useState(null);

    const { categories, loading: loadingCategories, createCategory } = useCategoriesStore();
    const [selectedCategoryIds, setSelectedCategoryIds] = useState(
        (gasto.categories ?? []).map((c) => c.id),
    );

    const handleToggleCategory = (id) => {
        setSelectedCategoryIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    };

    const handleCreateCategory = async (name) => {
        const created = await createCategory(name, token);
        setSelectedCategoryIds((prev) => [...prev, created.id]);
    };

    const totalInstallments = Number(installments) || 0;
    const paid = Math.min(paidQuotas, totalInstallments);
    const progressPct = totalInstallments > 0 ? Math.min(100, (paid / totalInstallments) * 100) : 0;

    const errors = useMemo(
        () => validateExpenseForm({ entity, name, amount, isInstallment, installments }),
        [entity, name, amount, isInstallment, installments],
    );
    const [submitted, setSubmitted] = useState(false);
    const visibleErrors = submitted ? errors : {};
    const installmentsFieldError =
        visibleErrors.installments ??
        (isInstallment && exceedsMaxInstallments(installments) ? errors.installments : undefined);
    const installmentsError =
        isInstallment && installments !== '' && totalInstallments < committedQuotas
            ? `No puede ser menor que las cuotas ya pagadas o pendientes (${committedQuotas}).`
            : null;

    const canSave = useMemo(() => {
        const base = name?.trim() && entity && Number(amount) > 0 && currency;
        if (!base) return false;
        if (!isInstallment) return true;
        const total = Number(installments);
        return (
            Number.isInteger(total) &&
            total >= Math.max(1, committedQuotas) &&
            !exceedsMaxInstallments(total)
        );
    }, [name, entity, amount, currency, isInstallment, installments, committedQuotas]);

    const amountNote =
        hasPayments && Number(amount) !== Number(gasto.amount)
            ? 'Los pagos ya registrados conservan su monto: el cambio solo afecta a las cuotas que faltan.'
            : null;

    const handleCreateEntity = async () => {
        if (!newEntityName.trim()) return;

        try {
            const created = await createEntity(newEntityName.trim(), token);
            setEntity(created.id);
            setShowNewEntity(false);
            setNewEntityName('');
        } catch (err) {
            console.error('Error creando entidad', err);
        }
    };

    const savingRef = useRef(false);
    savingRef.current = saving;
    const requestClose = () => {
        if (!savingRef.current) onClose?.();
    };

    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && !savingRef.current && onClose?.();
        document.addEventListener('keydown', onKey);

        const prevScroll = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevScroll;
        };
    }, [onClose]);

    const doSave = async (payload) => {
        setSaving(true);
        try {
            await onSave?.(payload);
        } catch (err) {
            console.error('Error actualizando gasto', err);
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async () => {
        if (saving) return;
        if (Object.keys(errors).length > 0 || !canSave) {
            setSubmitted(true);
            focusFirstError(containerRef.current, errors);
            return;
        }

        const payload = {
            financial_entity_id: entity,
            name: name.trim(),
            amount: Number(amount),
            number_of_quotas: isFixed
                ? gasto.number_of_quotas
                : isInstallment
                  ? Number(installments)
                  : 1,
            currency_type: currency,
            fixed_expense: isFixed,
            image_url: gasto.image_url ?? null,
            type,
            category_ids: selectedCategoryIds,
        };

        if (gasto.linked_purchase_id) {
            setPendingPayload(payload);
            setLinkedPrompt(true);
            return;
        }

        await doSave(payload);
    };

    const confirmLinked = async (applyToLinked) => {
        const payload = { ...pendingPayload, apply_to_linked: applyToLinked };
        setLinkedPrompt(false);
        setPendingPayload(null);
        await doSave(payload);
    };

    const modal = (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onMouseDown={requestClose}
            />

            <div
                ref={containerRef}
                className="
                    relative z-10 w-[92vw] max-w-2xl max-h-[85vh] overflow-y-auto
                    rounded-2xl shadow-xl bg-[#111714] border border-[#29382f]
                "
            >
                <header className="sticky top-0 flex items-center justify-between border-b border-[#29382f] px-6 py-4 bg-[#111714]">
                    <div className="flex items-center gap-3 text-white">
                        <Icon name="edit" className="text-primary" />
                        <h2 className="text-white text-lg font-bold">Editar Gasto/Deuda</h2>
                    </div>

                    <button
                        onClick={requestClose}
                        disabled={saving}
                        className="disabled:opacity-50 disabled:cursor-not-allowed flex h-9 w-9 items-center justify-center rounded-lg bg-[#29382f] text-white hover:bg-[#3d5245] cursor-pointer"
                    >
                        <Icon name="close" className="text-xl" />
                    </button>
                </header>

                <div className="p-6 space-y-6">
                    <LockedField reason={locks.type}>
                        <ExpenseTypeSelector type={type} setType={setType} />
                    </LockedField>

                    <div data-field="name">
                        <TextInput
                            label="Nombre del gasto"
                            placeholder="Ej: Préstamo personal"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            error={visibleErrors.name}
                        />
                    </div>

                    <ExpenseAmountSection
                        amount={amount}
                        setAmount={setAmount}
                        currency={currency}
                        setCurrency={setCurrency}
                        amountLock={locks.amount}
                        currencyLock={locks.currency_type}
                        amountNote={amountNote}
                        error={visibleErrors.amount}
                    />

                    <LockedField reason={locks.financial_entity_id}>
                        <EntitySelector
                            entity={entity}
                            setEntity={setEntity}
                            entities={entities}
                            showNewEntity={showNewEntity}
                            setShowNewEntity={setShowNewEntity}
                            newEntityName={newEntityName}
                            setNewEntityName={setNewEntityName}
                            handleCreateEntity={handleCreateEntity}
                            error={visibleErrors.entity}
                        />
                    </LockedField>

                    <LockedField reason={locks.mode}>
                        <ExpenseModeSelector
                            isInstallment={isInstallment}
                            isFixed={isFixed}
                            onChange={({ isInstallment: i, isFixed: f }) => {
                                setIsInstallment(i);
                                setIsFixed(f);
                            }}
                        />
                    </LockedField>

                    {isInstallment && (
                        <div className="space-y-1.5">
                            <ExpenseInstallmentsSection
                                installments={installments}
                                setInstallments={setInstallments}
                                paidInstallments={String(paidQuotas)}
                                setPaidInstallments={() => {}}
                                paid={paid}
                                totalInstallments={totalInstallments}
                                progressPct={progressPct}
                                installmentsLock={locks.number_of_quotas}
                                error={installmentsFieldError}
                                paidLock={paidLock}
                            />
                            {installmentsError && (
                                <p className="text-red-400 text-sm">{installmentsError}</p>
                            )}
                        </div>
                    )}

                    <CategorySelector
                        categories={categories}
                        selectedIds={selectedCategoryIds}
                        onToggle={handleToggleCategory}
                        onCreate={handleCreateCategory}
                        loading={loadingCategories}
                    />

                    {!isInstallment && !isFixed && (
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-3 select-none opacity-60">
                                <div
                                    className={`w-5 h-5 rounded flex items-center justify-center border shrink-0
                                    ${paidQuotas > 0 ? 'bg-primary border-primary' : 'border-[#3d5245] bg-[#1c2620]'}`}
                                >
                                    {paidQuotas > 0 && (
                                        <span className="text-black text-xs font-bold">✓</span>
                                    )}
                                </div>
                                <span className="text-white text-sm font-medium">Pagado</span>
                            </div>
                            <LockReason reason={paidLock} />
                        </div>
                    )}
                </div>

                <footer className="sticky bottom-0 flex flex-wrap items-center justify-end gap-3 border-t border-[#29382f] px-6 py-4 bg-[#111714]">
                    <ExpenseFormErrors errors={visibleErrors} />

                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="h-11 px-4 text-sm font-bold text-[#9eb7a8] hover:bg-[#29382f] rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancelar
                    </button>

                    <button
                        disabled={saving}
                        onClick={handleSubmit}
                        className="h-11 px-4 text-sm font-bold flex items-center gap-2 rounded-lg bg-primary text-black disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                            <Icon name="save" />
                        )}
                        {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </footer>

                {linkedPrompt && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 rounded-2xl p-4">
                        <div className="w-full max-w-sm rounded-xl bg-[#111714] p-6 border border-[#29382f] shadow-lg text-white">
                            <h3 className="text-lg font-bold mb-2">Movimiento vinculado</h3>
                            <p className="text-sm text-[#9eb7a8] mb-6">
                                Este movimiento está vinculado a otro en otra entidad. ¿Querés
                                aplicar los cambios también a ese movimiento?
                            </p>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => confirmLinked(true)}
                                    disabled={saving}
                                    className="h-11 px-4 text-sm font-bold rounded-lg bg-primary text-black cursor-pointer hover:bg-primary/80 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    Aplicar a ambos
                                </button>
                                <button
                                    onClick={() => confirmLinked(false)}
                                    disabled={saving}
                                    className="h-11 px-4 text-sm font-bold rounded-lg bg-[#29382f] text-white cursor-pointer hover:bg-[#3d5245] disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    Sólo este
                                </button>
                                <button
                                    onClick={() => {
                                        setLinkedPrompt(false);
                                        setPendingPayload(null);
                                    }}
                                    disabled={saving}
                                    className="h-9 px-4 text-sm font-bold text-[#9eb7a8] hover:bg-[#29382f] rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
