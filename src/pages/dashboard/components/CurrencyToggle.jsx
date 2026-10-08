import { Currency } from '@/utils/enums';

export default function CurrencyToggle({ currency, onChange }) {
    const options = Object.values(Currency);

    return (
        <div className="flex">
            <div className="flex h-10 flex-1 items-center justify-center rounded-lg bg-black/5 dark:bg-white/10 p-1">
                {options.map((cur) => (
                    <label
                        key={cur}
                        className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-2 has-checked:bg-white dark:has-checked:bg-background-dark has-checked:shadow-sm has-checked:text-slate-900 dark:has-checked:text-white text-slate-500 dark:text-slate-400 text-sm font-medium leading-normal"
                    >
                        <span className="truncate">{cur}</span>
                        <input
                            className="invisible w-0"
                            name="currency-switch"
                            type="radio"
                            value={cur}
                            checked={currency === cur}
                            onChange={() => onChange(cur)}
                        />
                    </label>
                ))}
            </div>
        </div>
    );
}
