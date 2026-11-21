import Icon from '@/components/Icon';
import { t } from '@/i18n';

export function TutorialCard({ onOpenTutorial }) {
    return (
        <div className="rounded-2xl border border-black/10 dark:border-white/10 p-4 bg-white/70 dark:bg-background-dark/70">
            <h2 className="text-base font-medium mb-1 text-slate-900 dark:text-white">
                {t('configuracion.tutorial')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                {t('configuracion.goOverHowToUseTheApp')}
            </p>

            <button
                type="button"
                onClick={onOpenTutorial}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold bg-primary text-background-dark hover:bg-primary/90 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
                <Icon name="school" className="text-lg" />
                {t('configuracion.seeTheTutorialAgain')}
            </button>
        </div>
    );
}
