export const MERCADO_PAGO_URL = 'https://www.mercadopago.com.ar/';

const ALIAS_PATTERN = /^[a-zA-Z0-9.-]{6,20}$/;

export const isValidMercadoPagoAlias = (value) => {
    const alias = (value ?? '').trim();
    return alias === '' || ALIAS_PATTERN.test(alias);
};
