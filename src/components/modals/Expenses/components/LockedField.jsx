import Icon from '@/components/Icon';

/**
 * Envuelve un campo del formulario de gasto que la API puede bloquear
 * (`gasto.edit_locks`). Con `reason`, deshabilita todos los controles de
 * adentro y muestra el motivo debajo; sin `reason`, no cambia nada.
 */
export default function LockedField({ reason, children }) {
    if (!reason) return children;

    return (
        <div className="space-y-1.5">
            <fieldset disabled className="opacity-60 [&_*]:cursor-not-allowed">
                {children}
            </fieldset>
            <LockReason reason={reason} />
        </div>
    );
}

export function LockReason({ reason }) {
    if (!reason) return null;
    return (
        <p className="flex items-start gap-1.5 text-xs text-[#9eb7a8]">
            <Icon name="lock" className="text-sm shrink-0" />
            <span>{reason}</span>
        </p>
    );
}
