import { useState, useEffect } from 'react';
import Icon from '@/components/Icon';
import { useEntitiesStore } from '@/store/use-entities-store';
import useAuth from '@/store/use-auth-store';
import Select from '@/components/Select';
import { useDiscardGuard } from '@/hooks/use-discard-guard';
import { getIntlLocale } from '@/i18n';
import { t } from '@/i18n';

export default function AprobarModal({ open, gasto, onClose, onConfirm, loading }) {
    const { token } = useAuth();
    const { entities, loading: loadingEntities, loadEntities } = useEntitiesStore();

    const [selectedMode, setSelectedMode] = useState('existing');
    const [selectedEntityId, setSelectedEntityId] = useState('');
    const [typedEntityName, setTypedEntityName] = useState(null);

    useEffect(() => {
        if (!open) return;
        const suggestedId = gasto?.suggested_entity_id;
        const store = useEntitiesStore.getState();
        if (store.entities.length === 0 || (suggestedId && !store.getEntityById(suggestedId))) {
            loadEntities(token);
        }
        setTypedEntityName(null);
        setSelectedEntityId(gasto?.suggested_entity_id?.toString() || '');
        setSelectedMode('existing');
    }, [open, gasto?.id, gasto?.suggested_entity_id, loadEntities, token]);

    const hasEntities = entities.length > 0;
    const checkingEntities = !hasEntities && loadingEntities;
    const mode = hasEntities ? selectedMode : 'new';
    const defaultEntityName = hasEntities
        ? ''
        : (gasto?.sender_name || gasto?.sender_email || '').trim();
    const newEntityName = typedEntityName ?? defaultEntityName;

    const initialEntityId = gasto?.suggested_entity_id?.toString() || '';
    const dirty =
        newEntityName.trim() !== defaultEntityName ||
        (hasEntities && selectedEntityId !== initialEntityId);
    const requestClose = useDiscardGuard(dirty, onClose, { busy: loading });

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === 'Escape' && requestClose();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, requestClose]);

    if (!open) return null;

    const canConfirm =
        !loading &&
        !checkingEntities &&
        (mode === 'existing' ? !!selectedEntityId : newEntityName.trim().length > 0);

    const handleConfirm = () => {
        if (mode === 'existing') {
            onConfirm(Number(selectedEntityId), null);
        } else {
            onConfirm(null, newEntityName.trim());
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onMouseDown={(e) => e.target === e.currentTarget && requestClose()}
        >
            <div
                className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md max-h-full overflow-y-auto p-4 sm:p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold mb-1 dark:text-white flex items-center gap-2">
                    <Icon name="check_circle" className="text-green-500" />
                    {t('compartidos.approveSharedExpense')}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
                    <span className="font-medium dark:text-white">{gasto?.name}</span>
                    {' · '}
                    {gasto?.currency_type} {Number(gasto?.amount).toLocaleString(getIntlLocale())}
                </p>

                {hasEntities && (
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setSelectedMode('existing')}
                            className={`flex-1 py-2 text-sm rounded-lg font-medium border transition-colors ${
                                mode === 'existing'
                                    ? 'bg-primary text-background-dark border-primary'
                                    : 'border-zinc-300 dark:border-zinc-700 dark:text-white'
                            }`}
                        >
                            {t('compartidos.existingEntity')}
                        </button>
                        <button
                            onClick={() => setSelectedMode('new')}
                            className={`flex-1 py-2 text-sm rounded-lg font-medium border transition-colors ${
                                mode === 'new'
                                    ? 'bg-primary text-background-dark border-primary'
                                    : 'border-zinc-300 dark:border-zinc-700 dark:text-white'
                            }`}
                        >
                            {t('compartidos.createNew')}
                        </button>
                    </div>
                )}

                {mode === 'existing' && (
                    <Select
                        value={selectedEntityId}
                        onChange={setSelectedEntityId}
                        placeholder={t('compartidos.selectAnEntity')}
                        aria-label={t('common.entity')}
                        className="w-full px-3 py-2 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white text-sm cursor-pointer"
                        options={entities.map((e) => ({ value: e.id, label: e.name }))}
                    />
                )}

                {mode === 'new' && (
                    <label className="block">
                        {!hasEntities && (
                            <span className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-200">
                                {t('compartidos.entityName')}
                            </span>
                        )}
                        <input
                            type="text"
                            aria-label={t('compartidos.entityName')}
                            placeholder={`Ej: ${gasto?.sender_name || t('compartidos.entityName')}`}
                            value={newEntityName}
                            disabled={checkingEntities}
                            onChange={(e) => setTypedEntityName(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border dark:border-zinc-700 bg-transparent dark:text-white text-sm disabled:opacity-50"
                        />
                    </label>
                )}

                <div className="flex justify-between mt-6">
                    <button
                        disabled={loading}
                        onClick={requestClose}
                        className="px-4 py-2 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-white text-sm"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        disabled={!canConfirm}
                        onClick={handleConfirm}
                        className="btn-save px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium flex items-center gap-2"
                    >
                        {loading ? (
                            <Icon name="progress_activity" className="animate-spin text-sm" />
                        ) : (
                            <Icon name="check" className="text-sm" />
                        )}
                        {t('compartidos.approve')}
                    </button>
                </div>
            </div>
        </div>
    );
}
