import AmountInput from './AmountInput';

const INPUT_CLASS =
    'form-input block h-12 w-full rounded-lg border border-gray-700 bg-background-dark px-3 text-white disabled:opacity-60 disabled:cursor-not-allowed';

export default function TextInput({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    disabled,
}) {
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
                    className={INPUT_CLASS}
                />
            ) : (
                <input
                    type={type}
                    required
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={INPUT_CLASS}
                />
            )}
        </div>
    );
}
