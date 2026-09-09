import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/Icon';
import { useDialogStore } from '@/store/use-dialog-store';

const TONE = {
    error: { icon: 'error', color: 'text-red-400', button: 'bg-red-600 hover:bg-red-700' },
    warning: {
        icon: 'warning',
        color: 'text-amber-400',
        button: 'bg-amber-600 hover:bg-amber-700',
    },
    info: { icon: 'info', color: 'text-primary', button: 'bg-primary hover:bg-primary/80' },
};

export default function GlobalDialog() {
    const current = useDialogStore((s) => s.current);
    const close = useDialogStore((s) => s.close);

    useEffect(() => {
        if (!current) return;
        const onKey = (e) => e.key === 'Escape' && close();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [current, close]);

    if (!current) return null;

    const tone = TONE[current.tone] ?? TONE.error;

    return createPortal(
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onMouseDown={(e) => e.target === e.currentTarget && close()}
        >
            <div className="w-[90vw] max-w-sm rounded-xl bg-[#111714] p-6 border border-[#29382f] shadow-lg text-white">
                <div className="flex items-start gap-3 mb-4">
                    <Icon name={tone.icon} className={`${tone.color} text-2xl shrink-0`} />
                    <div className="min-w-0">
                        <h2 className="text-lg font-bold">{current.title}</h2>
                        <p className="text-sm text-[#9eb7a8] mt-1 break-words">{current.message}</p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={close}
                        className={`cursor-pointer h-10 px-4 rounded-lg text-white text-sm font-bold transition-colors ${tone.button}`}
                    >
                        {current.confirmLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}
