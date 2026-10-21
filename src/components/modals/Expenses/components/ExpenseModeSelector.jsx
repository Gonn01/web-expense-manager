import Icon from '@/components/Icon';

export default function ExpenseModeSelector({ isInstallment, isFixed, onChange }) {
    const mode = isFixed ? 'fixed' : isInstallment ? 'installment' : 'none';

    const set = (next) => {
        onChange({
            isInstallment: next === 'installment',
            isFixed: next === 'fixed',
        });
    };

    return (
        <div className="flex h-12 items-center justify-center rounded-lg bg-[#29382f] p-1.5">
            <label className="flex cursor-pointer h-full grow items-center justify-center gap-2 rounded-md px-3 text-[#9eb7a8] text-sm font-medium has-checked:bg-white/10 has-checked:text-white">
                <Icon name="remove" />
                <span>Sin cuotas</span>
                <input
                    type="radio"
                    className="invisible w-0"
                    checked={mode === 'none'}
                    onChange={() => set('none')}
                />
            </label>

            <label className="flex cursor-pointer h-full grow items-center justify-center gap-2 rounded-md px-3 text-[#9eb7a8] text-sm font-medium has-checked:bg-blue-500/10 has-checked:text-blue-400">
                <Icon name="splitscreen" />
                <span>Por cuotas</span>
                <input
                    type="radio"
                    className="invisible w-0"
                    checked={mode === 'installment'}
                    onChange={() => set('installment')}
                />
            </label>

            <label className="flex cursor-pointer h-full grow items-center justify-center gap-2 rounded-md px-3 text-[#9eb7a8] text-sm font-medium has-checked:bg-yellow-500/10 has-checked:text-yellow-400">
                <Icon name="repeat" />
                <span>Fijo</span>
                <input
                    type="radio"
                    className="invisible w-0"
                    checked={mode === 'fixed'}
                    onChange={() => set('fixed')}
                />
            </label>
        </div>
    );
}
