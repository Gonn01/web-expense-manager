import { useState } from 'react';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import { t } from '@/i18n';

export default function DeleteExpenseModal({
    open,
    linked = false,
    linkedEntityName = '',
    notice,
    onCancel,
    onDelete,
}) {
    const [deleteLinked, setDeleteLinked] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const close = () => {
        setDeleteLinked(false);
        onCancel();
    };

    return (
        <ConfirmDeleteModal
            open={open}
            title={t('detalleGasto.deleteExpense')}
            message={
                linked ? (
                    <span className="block">
                        {notice}
                        <label className="mt-4 flex items-center gap-2 cursor-pointer select-none text-slate-900 dark:text-white">
                            <input
                                type="checkbox"
                                checked={deleteLinked}
                                onChange={(e) => setDeleteLinked(e.target.checked)}
                            />
                            {t('detalleGasto.alsoDeleteTheLinkedMovement')}
                            {linkedEntityName ? ` en ${linkedEntityName}` : ''}
                        </label>
                    </span>
                ) : (
                    notice
                )
            }
            confirmLabel={t('common.delete')}
            cancelLabel={t('common.cancel')}
            loading={deleting}
            onCancel={close}
            onConfirm={async () => {
                setDeleting(true);
                try {
                    await onDelete(deleteLinked);
                } finally {
                    setDeleting(false);
                    close();
                }
            }}
        />
    );
}
