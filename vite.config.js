import path from 'node:path';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        eslint({
            cache: false,
            include: ['src/**/*.js', 'src/**/*.jsx', 'eslint.config.js'],
        }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: { '@': path.resolve(process.cwd(), 'src') },
    },
});
