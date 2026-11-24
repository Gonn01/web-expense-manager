import { defineConfig } from '@playwright/test';

const API_URL = 'http://127.0.0.1:3100/api';
const WEB_URL = 'http://localhost:5173';

export default defineConfig({
    testDir: './e2e',
    testMatch: '**/*.spec.js',
    fullyParallel: false,
    workers: 1,
    retries: 0,
    timeout: 45000,
    expect: { timeout: 10000 },
    forbidOnly: Boolean(process.env.CI),
    reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
    outputDir: 'test-results',
    globalSetup: './e2e/support/global-setup.js',
    use: {
        baseURL: WEB_URL,
        locale: 'es-AR',
        channel: process.env.CI ? undefined : 'chrome',
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
    },
    webServer: {
        command: 'npx vite --host localhost --port 5173 --strictPort',
        url: WEB_URL,
        reuseExistingServer: false,
        timeout: 60000,
        env: {
            VITE_API_BASE_URL: API_URL,
            VITE_PUSHER_KEY: '',
            VITE_PUSHER_CLUSTER: '',
            VITE_FIREBASE_API_KEY: '',
            VITE_FIREBASE_AUTH_DOMAIN: '',
            VITE_FIREBASE_PROJECT_ID: '',
            VITE_FIREBASE_APP_ID: '',
        },
    },
});
