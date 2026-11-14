export default function RefundLockButton({ unlocked, onToggle }) {
    return (
        <button
            onClick={onToggle}
            title={unlocked ? 'Bloquear reembolsos' : 'Desbloquear reembolsos'}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                unlocked
                    ? 'border-red-500/60 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                    : 'border-slate-200 dark:border-[#29382f] bg-white dark:bg-[#111714] text-slate-500 dark:text-[#9eb7a8] hover:bg-slate-100 dark:hover:bg-[#29382f]'
            }`}
        >
            <span className="material-symbols-outlined text-base">
                {unlocked ? 'lock_open' : 'lock'}
            </span>
            {unlocked ? 'Desbloqueado' : 'Reembolsos'}
        </button>
    );
}
