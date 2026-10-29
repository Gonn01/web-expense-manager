export default function GoogleButton({ loading, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full justify-center items-center gap-3 rounded-lg border border-slate-300 dark:border-gray-700 px-3 py-2.5 text-sm text-slate-700 dark:text-gray-300"
        >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24">
                <g clipPath="url(#g)">
                    <path
                        d="M22.483 12.246c0-.812-.074-1.598-.197-2.356H12.234V14.332h5.897c-.286 1.535-1.116 2.856-2.374 3.73v2.664h3.752c1.925-1.746 2.975-4.789 2.975-8.48Z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12.234 23c2.99 0 5.479-.984 7.275-2.273l-3.752-2.664c-.984.656-2.167 1.055-3.523 1.055-2.623 0-4.855-1.805-5.684-4.234H2.672v2.75C4.468 20.91 8.055 23 12.234 23Z"
                        fill="#34A853"
                    />
                    <path
                        d="M6.548 14.883a6.77 6.77 0 0 1-.328-2c0-.696.122-1.368.328-1.993V8.148H2.672A10.34 10.34 0 0 0 1.5 12.89c0 1.688.444 3.29 1.172 4.742l3.876-2.75Z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12.234 6.664c1.453 0 2.685.492 3.623 1.375l3.736-3.656C17.705 2.637 15.224 1.5 12.234 1.5c-3.178 0-5.945 1.973-7.563 5.367l3.876 2.75c.83-2.43 3.062-3.735 5.687-3.735Z"
                        fill="#EA4335"
                    />
                </g>
                <defs>
                    <clipPath id="g">
                        <rect width="21" height="21.5" transform="translate(1.5 1.25)" />
                    </clipPath>
                </defs>
            </svg>

            {loading ? 'Conectando...' : 'Continuar con Google'}
        </button>
    );
}
