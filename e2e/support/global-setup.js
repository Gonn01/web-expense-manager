import { fork } from 'node:child_process';
import path from 'node:path';

const HEALTH_URL = 'http://127.0.0.1:3100/api/health';
const STARTUP_ATTEMPTS = 120;
const STARTUP_DELAY_MS = 500;
const SHUTDOWN_TIMEOUT_MS = 15000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForApi(child) {
    for (let attempt = 0; attempt < STARTUP_ATTEMPTS; attempt += 1) {
        if (child.exitCode !== null) throw new Error('La API local terminó antes de iniciar');
        try {
            const response = await fetch(HEALTH_URL);
            if (response.ok) return;
        } catch {}
        await wait(STARTUP_DELAY_MS);
    }
    throw new Error('La API local no respondió a tiempo');
}

function stopApi(child) {
    return new Promise((resolve) => {
        if (child.exitCode !== null) {
            resolve();
            return;
        }
        const timer = setTimeout(() => {
            child.kill();
            resolve();
        }, SHUTDOWN_TIMEOUT_MS);
        child.once('exit', () => {
            clearTimeout(timer);
            resolve();
        });
        child.send('shutdown');
    });
}

export default async function globalSetup() {
    const apiDirectory = process.env.E2E_API_DIR;
    if (!apiDirectory) {
        throw new Error('Definí E2E_API_DIR con la carpeta del repo api-plataformas-desarrollo');
    }

    const resolved = path.resolve(apiDirectory);
    const child = fork(path.join(resolved, 'scripts', 'local-stack.js'), [], {
        cwd: resolved,
        env: { ...process.env, PORT: '3100' },
        stdio: ['ignore', 'ignore', 'inherit', 'ipc'],
    });

    try {
        await waitForApi(child);
    } catch (error) {
        await stopApi(child);
        throw error;
    }

    return () => stopApi(child);
}
