import forms from '@tailwindcss/forms';

export default {
    darkMode: 'class',
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: '#38e07b',
                'background-light': '#f6f8f7',
                'background-dark': '#122017',
            },
            fontFamily: {
                display: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                DEFAULT: '0.25rem',
                lg: '0.5rem',
                xl: '0.75rem',
                full: '9999px',
            },
        },
    },
    plugins: [forms],
};
