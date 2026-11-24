import { expect, test } from '@playwright/test';
import es from '../src/i18n/locales/es.json' with { type: 'json' };
import { createAccount, shareExpense, signInBrowser } from './support/api.js';

const button = (scope, label) => scope.getByRole('button', { name: new RegExp(`${label}$`) });

async function approveInBrowser(page, expenseName) {
    await page.goto('/app/compartidos');
    await expect(page.getByText(expenseName).first()).toBeVisible();
    await button(page, es.compartidos.approve).first().click();
    await expect(page.getByText(es.compartidos.approveSharedExpense)).toBeVisible();
    await button(page, es.compartidos.approve).last().click();
    await expect(page.getByText(es.compartidos.approveSharedExpense)).toBeHidden();
}

test('aprobar, confirmar un pago y aceptar su reversión', async ({ page }) => {
    const ana = await createAccount('Ana');
    const beto = await createAccount('Beto');
    const { expense } = await shareExpense(ana, beto, 'Heladera compartida');
    await signInBrowser(page, beto);

    await approveInBrowser(page, 'Heladera compartida');
    await expect.poll(async () => (await ana.get(`/gastos/${expense.id}`)).status).toBe('ACTIVE');

    await ana.post(`/gastos/${expense.id}/settle-quota`, { direct: true });
    await page.reload();
    await expect(page.getByText('Heladera compartida').first()).toBeVisible();
    await button(page, es.common.confirm).first().click();
    await expect
        .poll(async () => Number((await ana.get(`/gastos/${expense.id}`)).payed_quotas))
        .toBe(1);

    const detail = await ana.get(`/gastos/${expense.id}`);
    const payment = detail.movements.find((movement) => movement.movement_type === 'PAYMENT');
    await ana.post(`/gastos/${expense.id}/pagos/${payment.id}/revertir`);

    await page.reload();
    await button(page, es.common.accept).first().click();
    await button(page, es.common.revert).last().click();

    await expect
        .poll(async () => Number((await ana.get(`/gastos/${expense.id}`)).payed_quotas))
        .toBe(0);
});

test('rechazar un gasto compartido lo informa a quien lo envió', async ({ page }) => {
    const ana = await createAccount('Ana');
    const beto = await createAccount('Beto');
    const { expense } = await shareExpense(ana, beto, 'Viaje rechazado');
    await signInBrowser(page, beto);

    await page.goto('/app/compartidos');
    await expect(page.getByText('Viaje rechazado').first()).toBeVisible();
    await button(page, es.compartidos.reject).first().click();
    await expect(page.getByText(es.compartidos.rejectExpense)).toBeVisible();
    await button(page, es.compartidos.reject).last().click();

    await expect.poll(async () => (await ana.get(`/gastos/${expense.id}`)).status).toBe('REJECTED');
});
