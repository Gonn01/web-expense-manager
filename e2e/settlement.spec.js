import { expect, test } from '@playwright/test';
import es from '../src/i18n/locales/es.json' with { type: 'json' };
import { createAccount, createEntity, createExpense, signInBrowser } from './support/api.js';

test('marca un gasto, cierra las cuentas y registra el pago', async ({ page }) => {
    const account = await createAccount('Cuentas');
    const entity = await createEntity(account, 'Banco de cuentas');
    const expense = await createExpense(account, entity.id, { name: 'Alquiler del mes' });
    await signInBrowser(page, account);

    await page.goto('/app/dashboard');
    await expect(page.getByText('Alquiler del mes').first()).toBeVisible();
    await page.getByRole('button', { name: new RegExp(`${es.common.settle}$`) }).click();
    await page.getByRole('button', { name: es.common.markPayment }).first().click();
    await page.getByRole('button', { name: new RegExp(`${es.modals.confirmPayment}$`) }).click();
    await expect(page.getByText(new RegExp(`1 / \\d+ ${es.dashboard.marked}`))).toBeVisible();

    expect(Number((await account.get(`/gastos/${expense.id}`)).payed_quotas)).toBe(0);

    const finish = page.getByRole('button', { name: new RegExp(`${es.common.finish}$`) });
    await finish.first().click();
    await expect(page.getByText(es.dashboard.finishThisMonthSSettlementPaymentsFor)).toBeVisible();
    await finish.last().click();

    await expect(page).toHaveURL(/\/app\/settlement\/\d+$/);
    await expect(page.getByText('Alquiler del mes').first()).toBeVisible();
    expect(Number((await account.get(`/gastos/${expense.id}`)).payed_quotas)).toBe(1);
});

test('descartar la sesión no registra pagos', async ({ page }) => {
    const account = await createAccount('Descarte');
    const entity = await createEntity(account, 'Banco descartado');
    const expense = await createExpense(account, entity.id, { name: 'Luz del mes' });
    await signInBrowser(page, account);

    await page.goto('/app/dashboard');
    await expect(page.getByText('Luz del mes').first()).toBeVisible();
    await page.getByRole('button', { name: new RegExp(`${es.common.settle}$`) }).click();
    await page.getByRole('button', { name: es.common.markPayment }).first().click();
    await page.getByRole('button', { name: new RegExp(`${es.modals.confirmPayment}$`) }).click();
    await expect(page.getByText(new RegExp(`1 / \\d+ ${es.dashboard.marked}`))).toBeVisible();

    const discard = page.getByRole('button', { name: es.common.discard });
    await discard.first().click();
    await expect(page.getByText(es.dashboard.discardThisSessionTheMarksAreLost)).toBeVisible();
    await discard.last().click();

    await expect(
        page.getByRole('button', { name: new RegExp(`${es.common.settle}$`) }),
    ).toBeVisible();
    expect(Number((await account.get(`/gastos/${expense.id}`)).payed_quotas)).toBe(0);
});
