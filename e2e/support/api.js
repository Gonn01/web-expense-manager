const API_URL = 'http://127.0.0.1:3100/api';
const PASSWORD = 'secreta123';

let sequence = 0;

async function request(method, path, { token, body } = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(`${method} ${path} respondió ${response.status}: ${json?.code ?? ''}`);
    }
    return json?.data;
}

export async function createAccount(name) {
    sequence += 1;
    const email = `${name.toLowerCase()}-${Date.now()}-${sequence}@test.com`;
    await request('POST', '/auth/register', { body: { name, email, password: PASSWORD } });
    const { user, token } = await request('POST', '/auth/login', {
        body: { email, password: PASSWORD },
    });

    const call = (method, path, body) => request(method, path, { token, body });
    return {
        user,
        token,
        email,
        password: PASSWORD,
        get: (path) => call('GET', path),
        post: (path, body = {}) => call('POST', path, body),
        put: (path, body = {}) => call('PUT', path, body),
    };
}

export const createEntity = (account, name) => account.post('/entidades-financieras', { name });

export const createExpense = (account, entityId, overrides = {}) =>
    account.post('/gastos', {
        financial_entity_id: entityId,
        name: 'Gasto',
        amount: 300,
        number_of_quotas: 3,
        currency_type: 'ARS',
        fixed_expense: false,
        type: 'EGRESO',
        ...overrides,
    });

export async function shareExpense(owner, receiver, name) {
    const entity = await createEntity(owner, `Con ${receiver.user.name}`);
    await owner.put(`/entidades-financieras/${entity.id}/vincular-usuario`, {
        email: receiver.email,
    });
    const expense = await createExpense(owner, entity.id, { name });
    return { entity, expense };
}

export async function signInBrowser(page, account) {
    await page.addInitScript(
        ({ user, token }) => {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem(`onboarding:seen:${user.id}`, '1');
            localStorage.setItem('ui:language', 'es');
        },
        { user: account.user, token: account.token },
    );
}

export async function skipOnboarding(page, account) {
    await page.addInitScript(
        ({ userId }) => {
            localStorage.setItem(`onboarding:seen:${userId}`, '1');
            localStorage.setItem('ui:language', 'es');
        },
        { userId: account.user.id },
    );
}
