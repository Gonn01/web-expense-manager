export default function ModalContainer({ children }) {
    return (
        <div
            className="w-full max-w-md rounded-xl border border-black/10 dark:border-white/10 
                       bg-white dark:bg-background-dark p-4 sm:p-6 shadow-2xl max-h-full overflow-y-auto"
            onMouseDown={(e) => e.stopPropagation()}
        >
            {children}
        </div>
    );
}
