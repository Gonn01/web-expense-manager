export default function ErrorMessage({ message }) {
    if (!message) return null;

    return (
        <div className="rounded-lg border border-red-400/30 bg-red-500/10 text-red-700 dark:text-red-200 px-3 py-2 text-sm">
            {message}
        </div>
    );
}
