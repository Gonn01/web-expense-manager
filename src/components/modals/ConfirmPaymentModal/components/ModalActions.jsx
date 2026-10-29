import Icon from '@/components/Icon';

export default function ModalActions({ onCancel, onConfirm, loading = false, disabled = false }) {
    return (
        <div className="mt-4 flex flex-col-reverse sm:flex-row sm:justify-center gap-3">
            <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="h-10 px-4 rounded-lg bg-slate-200 dark:bg-slate-700 text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-slate-900 dark:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Cancelar
            </button>

            <button
                type="button"
                onClick={onConfirm}
                disabled={loading || disabled}
                className="h-10 px-4 rounded-lg bg-primary text-background-dark text-sm font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <span className="w-4 h-4 border-2 border-background-dark/40 border-t-background-dark rounded-full animate-spin" />
                ) : (
                    <Icon name="check_circle" className="text-lg" />
                )}
                {loading ? 'Guardando...' : 'Confirmar Pago'}
            </button>
        </div>
    );
}
