import { useCallback, useEffect, useRef, useState } from 'react';
import useAuth from '@/store/use-auth-store';
import { hasSeenOnboarding, useOnboardingStore } from '@/store/use-onboarding-store';
import { ONBOARDING_STEPS } from '@/components/onboarding/onboarding-steps';

const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

export function useOnboardingAutoOpen() {
    const userId = useAuth((s) => s.user?.id);
    const openOnboarding = useOnboardingStore((s) => s.openOnboarding);

    useEffect(() => {
        if (userId != null && !hasSeenOnboarding(userId)) openOnboarding(userId);
    }, [userId, openOnboarding]);
}

export function useOnboarding() {
    const open = useOnboardingStore((s) => s.open);
    const closeOnboarding = useOnboardingStore((s) => s.closeOnboarding);
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(1);
    const dialogRef = useRef(null);

    const total = ONBOARDING_STEPS.length;
    const isFirst = step === 0;
    const isLast = step === total - 1;

    const finish = useCallback(() => {
        closeOnboarding();
        setStep(0);
    }, [closeOnboarding]);

    const next = useCallback(() => {
        if (isLast) {
            finish();
            return;
        }
        setDirection(1);
        setStep((s) => s + 1);
    }, [isLast, finish]);

    const back = useCallback(() => {
        if (isFirst) return;
        setDirection(-1);
        setStep((s) => s - 1);
    }, [isFirst]);

    const goTo = useCallback(
        (index) => {
            setDirection(index >= step ? 1 : -1);
            setStep(index);
        },
        [step],
    );

    useEffect(() => {
        if (!open) return;
        const previous = document.activeElement;
        return () => previous?.focus?.();
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                finish();
            } else if (e.key === 'ArrowRight' && !isLast) {
                next();
            } else if (e.key === 'ArrowLeft') {
                back();
            } else if (e.key === 'Tab') {
                const nodes = dialogRef.current?.querySelectorAll(FOCUSABLE);
                if (!nodes?.length) return;
                const first = nodes[0];
                const last = nodes[nodes.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, isLast, next, back, finish]);

    return {
        open,
        step,
        direction,
        total,
        isFirst,
        isLast,
        current: ONBOARDING_STEPS[step],
        next,
        back,
        goTo,
        skip: finish,
        dialogRef,
    };
}
