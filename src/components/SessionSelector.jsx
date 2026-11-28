import Icon from '@/components/Icon';
import { t } from '@/i18n';

function ArrowButton({ icon, label, disabled, spin = false, onClick }) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            disabled={disabled}
            onClick={onClick}
            className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
            <Icon name={icon} className={`text-xl ${spin ? 'animate-spin' : ''}`} />
        </button>
    );
}

export default function SessionSelector({
    label,
    canGoBack,
    canGoForward,
    loading,
    onBack,
    onForward,
}) {
    return (
        <div className="flex items-center justify-center gap-1 rounded-xl border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-2 py-1">
            <ArrowButton
                icon={loading ? 'progress_activity' : 'chevron_left'}
                spin={loading}
                label={loading ? t('charts.loadingSessions') : t('charts.previousSession')}
                disabled={!canGoBack || loading}
                onClick={onBack}
            />
            <span
                aria-live="polite"
                className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-slate-800 dark:text-slate-100 sm:flex-none sm:min-w-56"
            >
                {label}
            </span>
            <ArrowButton
                icon="chevron_right"
                label={t('charts.followingSession')}
                disabled={!canGoForward}
                onClick={onForward}
            />
        </div>
    );
}
