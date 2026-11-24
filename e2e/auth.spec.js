import { expect, test } from '@playwright/test';
import es from '../src/i18n/locales/es.json' with { type: 'json' };
import { createAccount, signInBrowser, skipOnboarding } from './support/api.js';

const submitLogin = async (page, email, password) => {
    await page.getByPlaceholder(es.common.eGJohnEmailCom).fill(email);
    await page.getByPlaceholder(es.auth.eGMypassword123).fill(password);
    await page.getByRole('button', { name: es.auth.signIn2 }).click();
};

test('inicia sesión y llega al dashboard', async ({ page }) => {
    const account = await createAccount('Login');
    await skipOnboarding(page, account);

    await page.goto('/login');
    await submitLogin(page, account.email, account.password);

    await expect(page).toHaveURL(/\/app\/dashboard$/);
});

test('bloquea el acceso después de varios intentos fallidos', async ({ page }) => {
    const account = await createAccount('Bloqueo');
    await skipOnboarding(page, account);
    await page.goto('/login');

    for (let attempt = 0; attempt < 5; attempt += 1) {
        await submitLogin(page, account.email, 'incorrecta');
        await expect(page.getByText(es.errors.codes.CREDENCIALES_INVALIDAS.message)).toBeVisible();
    }

    await submitLogin(page, account.email, account.password);

    await expect(page.getByText(es.errors.codes.DEMASIADOS_INTENTOS.message)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
});

test('cerrar todas las sesiones invalida el token y vuelve al login', async ({ page }) => {
    const account = await createAccount('Sesiones');
    await signInBrowser(page, account);

    await page.goto('/app/configuracion');
    const revokeButtons = page.getByRole('button', { name: es.configuracion.revokeSessionsAction });
    await revokeButtons.first().click();
    await expect(page.getByText(es.configuracion.revokeSessionsConfirmMessage)).toBeVisible();
    await revokeButtons.last().click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(account.get('/dashboard')).rejects.toThrow(/401/);
});
