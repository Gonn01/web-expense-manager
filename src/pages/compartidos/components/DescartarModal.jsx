import { useState } from 'react';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';

function MirrorOption({ name, checked, onChange, title, hint }) {
    return (
        <label className="flex items-start gap-2 cursor-pointer select-none rounded-lg border border-slate-200 dark:border-[#29382f] p-3">
            <input
                type="radio"
                name="mirror-choice"
                checked={checked}
                onChange={onChange}
                className="mt-0.5"
            />
            <span className="min-w-0">
                <span className="block font-semibold text-slate-900 dark:text-white">
                    {title} {name}
                </span>
                <span className="block text-xs text-slate-500 dark:text-[#9eb7a8]">{hint}</span>
            </span>
        </label>
    );
}

export default function DescartarModal({ item, loading, onClose, onConfirm }) {
    const [deleteLinked, setDeleteLinked] = useState(null);
    const hasMirror = item.mirror_id != null;
    const mirrorName = item.mirror_entity_name ?? 'la otra entidad';
    const paidQuotas = Number(item.mirror_payed_quotas) || 0;

    const message = hasMirror ? (
        <span className="flex flex-col gap-2">
            <span className="block">¿Qué hacemos con el movimiento en {mirrorName}?</span>
            <MirrorOption
                name={`en ${mirrorName}`}
                title="Conservarlo"
                hint="El pago existió: queda como un gasto independiente."
                checked={deleteLinked === false}
                onChange={() => setDeleteLinked(false)}
            />
            <MirrorOption
                name={`en ${mirrorName}`}
                title="Eliminarlo"
                hint={
                    paidQuotas > 0
                        ? `El gasto fue un error. Tiene ${paidQuotas} ${paidQuotas === 1 ? 'pago registrado' : 'pagos registrados'} que dejan de contar.`
                        : 'El gasto fue un error: deja de contar.'
                }
                checked={deleteLinked === true}
                onChange={() => setDeleteLinked(true)}
            />
        </span>
    ) : (
        `"${item.name}" deja de aparecer para vos y para ${item.receiver_name ?? 'la otra persona'}.`
    );

    return (
        <ConfirmDeleteModal
            open
            title="Descartar gasto"
            message={message}
            confirmLabel="Descartar"
            loading={loading}
            confirmDisabled={hasMirror && deleteLinked === null}
            onCancel={onClose}
            onConfirm={() => onConfirm(hasMirror ? deleteLinked : undefined)}
        />
    );
}
