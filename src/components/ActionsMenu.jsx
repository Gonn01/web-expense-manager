import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';

export default function ActionsMenu({ items, icon = 'settings', label = 'Opciones' }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!open) return;

        const handlePointerDown = (e) => {
            if (!containerRef.current?.contains(e.target)) setOpen(false);
        };
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    const visibleItems = items.filter(Boolean);

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-label={label}
                aria-haspopup="menu"
                aria-expanded={open}
                title={label}
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-primary cursor-pointer transition-colors ${
                    open ? 'bg-primary/30' : 'bg-primary/20 hover:bg-primary/30'
                }`}
            >
                <Icon name={icon} />
            </button>

            {open && (
                <div
                    role="menu"
                    className="absolute right-0 z-40 mt-2 min-w-56 overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 py-1 shadow-xl"
                >
                    {visibleItems.map((item) => (
                        <button
                            key={item.label}
                            type="button"
                            role="menuitem"
                            disabled={item.disabled}
                            onClick={() => {
                                setOpen(false);
                                item.onClick();
                            }}
                            className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                item.tone === 'danger'
                                    ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
                                    : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5'
                            }`}
                        >
                            <Icon name={item.icon} className="text-xl" />
                            <span className="truncate">{item.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
