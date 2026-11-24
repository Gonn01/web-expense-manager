import Icon from '@/components/Icon';
import { t } from '@/i18n';

export function SesionesCard({ onRevokeSessions }) {
    return (
        <div className="rounded-2xl border border-black/10 dark:border-white/10 p-4 bg-white/70 dark:bg-background-dark/70">
            <h2 className="text-base font-medium mb-1 text-slate-900 dark:text-white">
                {t('configuracion.revokeSessionsTitle')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                {t('configuracion.revokeSessionsHint')}
            </p>

            <button
                type="button"
                onClick={onRevokeSessions}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold border border-red-600/40 text-red-700 hover:bg-red-600/10 dark:border-red-400/40 dark:text-red-400 dark:hover:bg-red-400/10 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
                <Icon name="devices" className="text-lg" />
                {t('configuracion.revokeSessionsAction')}
            </button>
        </div>
    );
}
