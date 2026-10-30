export default function InfoItem({ label, value }) {
    return (
        <div className="flex flex-col gap-1 min-w-0">
            <p className="text-sm text-slate-500 dark:text-[#9eb7a8]">{label}</p>
            <p className="text-base font-medium text-slate-900 dark:text-white break-words">
                {value}
            </p>
        </div>
    );
}
