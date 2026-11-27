export default function SubmitButton({ loading, children }) {
    return (
        <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="btn-save flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-3 text-sm font-semibold text-black"
        >
            {loading && (
                <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current/30 border-t-current" />
            )}
            {children}
        </button>
    );
}
