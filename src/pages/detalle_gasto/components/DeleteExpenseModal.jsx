import { useState } from 'react';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';

export default function DeleteExpenseModal({
    open,
    linked = false,
    linkedEntityName = '',
    onCancel,
    onDelete,
}) {
    const [deleteLinked, setDeleteLinked] = useState(false);

    const close = () => {
        setDeleteLinked(false);
        onCancel();
    };

    return (
        <ConfirmDeleteModal
            open={open}
            title="Eliminar gasto"
            message={
                linked ? (
                    <span className="block">
                        Esta acción no se puede deshacer.
                        <label className="mt-4 flex items-center gap-2 cursor-pointer select-none text-slate-900 dark:text-white">
                            <input
                                type="checkbox"
                                checked={deleteLinked}
                                onChange={(e) => setDeleteLinked(e.target.checked)}
                            />
                            Eliminar también el movimiento vinculado
                            {linkedEntityName ? ` en ${linkedEntityName}` : ''}
                        </label>
                    </span>
                ) : (
                    'Esta acción no se puede deshacer.'
                )
            }
            confirmLabel="Eliminar"
            cancelLabel="Cancelar"
            onCancel={close}
            onConfirm={() => {
                onDelete(deleteLinked);
                close();
            }}
        />
    );
}
