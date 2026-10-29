export default function BrandHeader({ title, subtitle }) {
    return (
        <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{title}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">{subtitle}</p>
        </div>
    );
}
