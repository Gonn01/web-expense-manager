import Icon from '@/components/Icon';

export default function OnboardingSlide({ step, direction, titleId, descriptionId }) {
    const animation = direction > 0 ? 'animate-onboarding-next' : 'animate-onboarding-prev';

    return (
        <div
            className={`flex flex-col items-center text-center motion-reduce:animate-none ${animation}`}
            aria-live="polite"
        >
            <div className="mb-5 flex size-16 sm:size-20 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Icon name={step.icon} className="text-4xl sm:text-5xl" />
            </div>
            <h2
                id={titleId}
                className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white break-words"
            >
                {step.title}
            </h2>
            <p
                id={descriptionId}
                className="mt-3 max-w-sm text-base leading-relaxed text-slate-600 dark:text-[#9eb7a8] break-words"
            >
                {step.text}
            </p>
        </div>
    );
}
