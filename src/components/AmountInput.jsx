import { useLayoutEffect, useRef } from 'react';
import {
    caretAfterSignificantChars,
    countSignificantChars,
    formatAmountInput,
    parseAmountInput,
} from '@/utils/amount-input';

export default function AmountInput({ value, onChange, ...props }) {
    const inputRef = useRef(null);
    const pendingCaret = useRef(null);
    const formatted = formatAmountInput(value);

    useLayoutEffect(() => {
        const input = inputRef.current;
        if (pendingCaret.current === null || !input) return;
        const caret = caretAfterSignificantChars(formatted, pendingCaret.current);
        pendingCaret.current = null;
        input.setSelectionRange(caret, caret);
    });

    const handleChange = (e) => {
        const typed = e.target.value;
        pendingCaret.current = countSignificantChars(
            typed,
            e.target.selectionStart ?? typed.length,
        );
        onChange(parseAmountInput(typed));
    };

    return (
        <input
            {...props}
            ref={inputRef}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={formatted}
            onChange={handleChange}
        />
    );
}
