import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';

export default function Snackbar({ message, icon, type = 'success', onClose, duration = 4000 }) {
    useEffect(() => {
        const t = setTimeout(onClose, duration);
        return () => clearTimeout(t);
    }, [onClose, duration]);

    const iconName = icon || (type === 'error' ? 'error' : 'check_circle');
    const iconColor = type === 'error' ? 'text-red-400' : 'text-primary';

    return createPortal(
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg bg-slate-50 dark:bg-[#1c2620] border border-slate-200 dark:border-[#29382f] text-slate-900 dark:text-white text-sm font-medium animate-slide-in">
            <Icon name={iconName} className={`${iconColor} text-xl shrink-0`} />
            <span>{message}</span>
            <button
                onClick={onClose}
                className="ml-2 text-slate-500 dark:text-[#9eb7a8] hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
                <Icon name="close" className="text-base" />
            </button>
        </div>,
        document.body,
    );
}
