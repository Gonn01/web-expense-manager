import Icon from '@/components/Icon';
import { t } from '@/i18n';

export default function OnboardingActions({ isFirst, isLast, onBack, onNext }) {
    return (
        <div className="flex items-center justify-between gap-2">
            <button
                type="button"
                onClick={onBack}
                disabled={isFirst}
                aria-hidden={isFirst}
                tabIndex={isFirst ? -1 : undefined}
                className={`cursor-pointer inline-flex h-11 items-center gap-1 px-3 rounded-lg text-sm font-bold text-slate-600 dark:text-[#9eb7a8] hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
                    isFirst ? 'invisible' : ''
                }`}
            >
                <Icon name="arrow_back" className="text-lg" />
                {t('onboarding.back')}
            </button>

            <button
                type="button"
                autoFocus
                onClick={onNext}
                className="cursor-pointer inline-flex h-11 items-center gap-1 px-5 rounded-lg text-sm font-bold bg-primary text-background-dark hover:bg-primary/90 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
                {isLast ? t('onboarding.finish') : t('onboarding.next')}
                {!isLast && <Icon name="arrow_forward" className="text-lg" />}
            </button>
        </div>
    );
}
