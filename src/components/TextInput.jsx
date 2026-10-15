import Icon from '@/components/Icon';

export default function TextInput({ label, type = 'text', value, onChange, placeholder, error }) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">{label}</label>
            <input
                type={type}
                required
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                aria-invalid={error ? true : undefined}
                className={`form-input block h-12 w-full rounded-lg border bg-background-dark px-3 text-white ${
                    error ? 'border-red-500' : 'border-gray-700'
                }`}
            />
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
