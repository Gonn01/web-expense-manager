import { useState } from 'react';
import Icon from '@/components/Icon';

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
                aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
                <Icon name={show ? 'visibility_off' : 'visibility'} className="text-xl" />
            </button>
        </div>
    );
}
