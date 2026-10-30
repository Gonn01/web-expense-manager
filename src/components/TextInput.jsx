import Icon from '@/components/Icon';
import AmountInput from './AmountInput';

const INPUT_CLASS =
    'form-input block h-12 w-full rounded-lg border bg-background-dark px-3 text-white disabled:opacity-60 disabled:cursor-not-allowed';

export default function TextInput({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    disabled,
    error,
}) {
    const className = `${INPUT_CLASS} ${error ? 'border-red-500' : 'border-gray-700'}`;

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">{label}</label>
            {type === 'amount' ? (
                <AmountInput
                    required
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    aria-invalid={error ? true : undefined}
                    className={className}
                />
            ) : (
                <input
                    type={type}
                    required
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    aria-invalid={error ? true : undefined}
                    className={className}
                />
            )}
            {error && <FieldError message={error} />}
        </div>
    );
}

export function FieldError({ message }) {
    return (
        <p role="alert" className="flex items-center gap-1 text-red-400 text-sm">
            <Icon name="error" className="text-base" />
            {message}
        </p>
    );
}
