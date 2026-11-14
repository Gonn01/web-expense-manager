export default function SubmitButton({ loading, children }) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="btn-save w-full rounded-lg bg-primary px-3 py-3 text-sm font-semibold text-black"
        >
            {loading ? 'Cargando...' : children}
        </button>
    );
}
