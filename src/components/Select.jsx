import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';

const SEARCH_THRESHOLD = 10;
const POPOVER_MAX_HEIGHT = 288;
const POPOVER_GAP = 4;

function normalize(text) {
    return String(text ?? '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase();
}

export default function Select({
    value,
    onChange,
    options,
    placeholder,
    disabled = false,
    className = '',
    id,
    'aria-label': ariaLabel,
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const [position, setPosition] = useState(null);

    const triggerRef = useRef(null);
    const popoverRef = useRef(null);
    const searchRef = useRef(null);
    const listRef = useRef(null);
    const listId = useId();

    const searchable = options.length > SEARCH_THRESHOLD;
    const selected = options.find((o) => String(o.value) === String(value ?? ''));

    const visibleOptions = useMemo(() => {
        const q = normalize(query.trim());
        return q ? options.filter((o) => normalize(o.label).includes(q)) : options;
    }, [options, query]);

    const updatePosition = useCallback(() => {
        const rect = triggerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const spaceBelow = window.innerHeight - rect.bottom;
        const openUp = spaceBelow < POPOVER_MAX_HEIGHT && rect.top > spaceBelow;
        setPosition({
            left: rect.left,
            width: rect.width,
            top: openUp ? undefined : rect.bottom + POPOVER_GAP,
            bottom: openUp ? window.innerHeight - rect.top + POPOVER_GAP : undefined,
            maxHeight: Math.max(160, (openUp ? rect.top : spaceBelow) - POPOVER_GAP * 3),
        });
    }, []);

    const close = useCallback((refocus = true) => {
        setOpen(false);
        setQuery('');
        if (refocus) triggerRef.current?.focus();
    }, []);

    const openPopover = () => {
        if (disabled) return;
        const current = visibleOptions.findIndex((o) => String(o.value) === String(value ?? ''));
        setActiveIndex(Math.max(0, current));
        setOpen(true);
    };

    const choose = (option) => {
        onChange?.(String(option.value));
        close();
    };

    useLayoutEffect(() => {
        if (!open) return;
        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [open, updatePosition]);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e) => {
            if (triggerRef.current?.contains(e.target) || popoverRef.current?.contains(e.target)) {
                return;
            }
            close(false);
        };
        document.addEventListener('mousedown', onPointerDown);
        return () => document.removeEventListener('mousedown', onPointerDown);
    }, [open, close]);

    useEffect(() => {
        if (open && searchable) searchRef.current?.focus();
        else if (open) listRef.current?.focus();
    }, [open, searchable]);

    useEffect(() => {
        if (!open) return;
        listRef.current
            ?.querySelector(`[data-index="${activeIndex}"]`)
            ?.scrollIntoView({ block: 'nearest' });
    }, [open, activeIndex]);

    const handleListKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(visibleOptions.length - 1, i + 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(0, i - 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const option = visibleOptions[activeIndex];
            if (option) choose(option);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            close();
        } else if (e.key === 'Tab') {
            close(false);
        }
    };

    const handleTriggerKeyDown = (e) => {
        if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
            e.preventDefault();
            openPopover();
        }
    };

    return (
        <>
            <button
                ref={triggerRef}
                id={id}
                type="button"
                role="combobox"
                aria-label={ariaLabel}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={open ? listId : undefined}
                disabled={disabled}
                onClick={() => (open ? close() : openPopover())}
                onKeyDown={handleTriggerKeyDown}
                className={`flex items-center justify-between gap-2 text-left disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
            >
                <span className={`truncate ${selected ? '' : 'text-slate-400'}`}>
                    {selected ? selected.label : (placeholder ?? '')}
                </span>
                <Icon
                    name="expand_more"
                    className={`shrink-0 text-xl text-slate-400 transition-transform ${
                        open ? 'rotate-180' : ''
                    }`}
                />
            </button>

            {open &&
                position &&
                createPortal(
                    <div
                        ref={popoverRef}
                        onKeyDown={handleListKeyDown}
                        style={{
                            position: 'fixed',
                            left: position.left,
                            width: position.width,
                            top: position.top,
                            bottom: position.bottom,
                            maxHeight: Math.min(POPOVER_MAX_HEIGHT, position.maxHeight),
                        }}
                        className="z-[60] flex min-w-40 flex-col overflow-hidden rounded-lg border border-black/10 dark:border-[#3d5245] bg-white dark:bg-[#1c2620] shadow-xl"
                    >
                        {searchable && (
                            <div className="flex items-center gap-2 border-b border-black/10 dark:border-[#3d5245] px-3">
                                <Icon name="search" className="text-lg text-slate-400" />
                                <input
                                    ref={searchRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        setActiveIndex(0);
                                    }}
                                    placeholder="Buscar..."
                                    aria-label="Buscar opción"
                                    aria-controls={listId}
                                    autoComplete="off"
                                    className="h-10 w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                                />
                            </div>
                        )}

                        <ul
                            ref={listRef}
                            id={listId}
                            role="listbox"
                            tabIndex={-1}
                            className="flex-1 overflow-y-auto py-1"
                        >
                            {visibleOptions.length === 0 ? (
                                <li className="px-3 py-2 text-sm text-slate-400">Sin resultados</li>
                            ) : (
                                visibleOptions.map((option, index) => {
                                    const isSelected = String(option.value) === String(value ?? '');
                                    return (
                                        <li
                                            key={`${option.value}-${index}`}
                                            data-index={index}
                                            role="option"
                                            aria-selected={isSelected}
                                            onMouseEnter={() => setActiveIndex(index)}
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => choose(option)}
                                            className={`flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm ${
                                                index === activeIndex
                                                    ? 'bg-black/5 dark:bg-white/10'
                                                    : ''
                                            } ${
                                                isSelected
                                                    ? 'font-semibold text-primary'
                                                    : 'text-slate-900 dark:text-white'
                                            }`}
                                        >
                                            <span className="truncate">{option.label}</span>
                                            {isSelected && (
                                                <Icon name="check" className="shrink-0 text-base" />
                                            )}
                                        </li>
                                    );
                                })
                            )}
                        </ul>
                    </div>,
                    document.body,
                )}
        </>
    );
}
