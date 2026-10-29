import { useState } from 'react';

export default function PasswordInput({ value, onChange, placeholder }) {
    const [show, setShow] = useState(false);

    return (
        <div className="relative">
            <input
                type={show ? 'text' : 'password'}
                required
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="form-input block h-12 w-full rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-background-dark px-3 text-slate-900 dark:text-white"
            />
            <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
                {show ? '🙈' : '👁️'}
            </button>
        </div>
    );
}
