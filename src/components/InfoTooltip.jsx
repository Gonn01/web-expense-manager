import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';

/**
 * Ícono de ayuda con un texto explicativo flotante — para aclarar conceptos
 * del dominio (qué es una "entidad", qué pasa en "modo hacer cuentas", etc.)
 * sin ocupar espacio permanente en la UI.
 *
 * Funciona con hover (desktop) y con click/tap (mobile y teclado), y se
 * cierra con click afuera o Escape.
 */
export default function InfoTooltip({ text, className = '', align = 'center', side = 'bottom' }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const onClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => e.key === 'Escape' && setOpen(false);
        document.addEventListener('mousedown', onClickOutside);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClickOutside);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const alignClass = {
        center: 'left-1/2 -translate-x-1/2',
        start: 'left-0',
        end: 'right-0',
    }[align];

    // "bottom" (default) abre el texto debajo del ícono — más seguro cuando el
    // ícono está pegado arriba de un contenedor con scroll (ej. un <h1> de
    // pantalla), donde abrir hacia arriba lo corta contra el borde superior.
    const sideClass = side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';

    return (
        <span ref={ref} className={`relative inline-flex group ${className}`}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label="Más información"
                aria-expanded={open}
                className="cursor-pointer flex items-center justify-center text-slate-400 hover:text-primary dark:text-slate-500 dark:hover:text-primary transition-colors"
            >
                <Icon name="help" className="text-base" />
            </button>

            <span
                role="tooltip"
                className={`absolute ${alignClass} ${sideClass} w-64 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs leading-relaxed px-3 py-2 shadow-lg z-20 transition-opacity ${
                    open
                        ? 'opacity-100 pointer-events-auto'
                        : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'
                }`}
            >
                {text}
            </span>
        </span>
    );
}
