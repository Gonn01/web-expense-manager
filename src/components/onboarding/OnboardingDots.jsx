import { t } from '@/i18n';

export default function OnboardingDots({ total, current, onSelect }) {
    return (
        <div
            className="flex items-center justify-center gap-1"
            role="group"
            aria-label={t('common.progress')}
        >
            {Array.from({ length: total }, (_, index) => {
                const active = index === current;
                return (
                    <button
                        key={index}
                        type="button"
                        onClick={() => onSelect(index)}
                        aria-label={t('onboarding.goToStep', { step: index + 1, total })}
                        aria-current={active ? 'step' : undefined}
                        className="cursor-pointer flex h-6 items-center justify-center px-1 rounded-full focus-visible:outline-2 focus-visible:outline-primary"
                    >
                        <span
                            className={`block h-2 rounded-full transition-[width,background-color] duration-300 ease-snappy motion-reduce:transition-none ${
                                active
                                    ? 'w-6 bg-primary'
                                    : 'w-2 bg-slate-300 dark:bg-[#29382f] hover:bg-slate-400 dark:hover:bg-[#3d5245]'
                            }`}
                        />
                    </button>
                );
            })}
        </div>
    );
}
