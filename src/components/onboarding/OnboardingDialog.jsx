import { useId } from 'react';
import { createPortal } from 'react-dom';
import { useOnboarding } from '@/hooks/use-onboarding';
import OnboardingSlide from './OnboardingSlide';
import OnboardingDots from './OnboardingDots';
import OnboardingActions from './OnboardingActions';
import { t } from '@/i18n';

export default function OnboardingDialog() {
    const {
        open,
        step,
        direction,
        total,
        isFirst,
        isLast,
        current,
        next,
        back,
        goTo,
        skip,
        dialogRef,
    } = useOnboarding();
    const titleId = useId();
    const descriptionId = useId();

    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                className="w-full max-w-md max-h-full overflow-y-auto rounded-xl border border-slate-200 dark:border-[#29382f] bg-white dark:bg-[#111714] p-5 sm:p-6 shadow-2xl animate-slide-in motion-reduce:animate-none"
            >
                <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-medium text-slate-500 dark:text-[#9eb7a8]">
                        {t('onboarding.stepOf', { step: step + 1, total })}
                    </span>
                    <button
                        type="button"
                        onClick={skip}
                        className="cursor-pointer h-9 px-3 rounded-lg text-sm font-bold text-slate-600 dark:text-[#9eb7a8] hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-primary"
                    >
                        {t('onboarding.skip')}
                    </button>
                </div>

                <div className="min-h-64 sm:min-h-60 flex items-center justify-center overflow-hidden">
                    <OnboardingSlide
                        key={step}
                        step={current}
                        direction={direction}
                        titleId={titleId}
                        descriptionId={descriptionId}
                    />
                </div>

                <div className="mt-5 mb-4">
                    <OnboardingDots total={total} current={step} onSelect={goTo} />
                </div>

                <OnboardingActions isFirst={isFirst} isLast={isLast} onBack={back} onNext={next} />
            </div>
        </div>,
        document.body,
    );
}
