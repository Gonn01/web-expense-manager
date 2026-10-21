export default function Loader({ label = 'Preparando información...' }) {
    return (
        <div className="min-h-dvh flex flex-col items-center justify-center text-emerald-300/80">
            <div className="flex gap-2 mb-4">
                <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.2s]" />
                <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.1s]" />
                <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" />
            </div>

            <p className="text-sm tracking-wide opacity-80">{label}</p>
        </div>
    );
}
