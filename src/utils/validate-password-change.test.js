import { describe, expect, it } from 'vitest';
import { validatePasswordChange } from './validate-password-change';

const valid = {
    hasPassword: false,
    currentPassword: '',
    newPassword: '123456',
    confirmPassword: '123456',
};

describe('validatePasswordChange', () => {
    it('una cuenta de Google define su contraseña sin la actual', () => {
        expect(validatePasswordChange(valid)).toBeNull();
    });

    it('exige la contraseña actual si la cuenta ya tiene una', () => {
        expect(validatePasswordChange({ ...valid, hasPassword: true })).toBe(
            'configuracion.passwordCurrentRequired',
        );
    });

    it('acepta el cambio con la contraseña actual', () => {
        expect(
            validatePasswordChange({ ...valid, hasPassword: true, currentPassword: 'actual' }),
        ).toBeNull();
    });

    it('rechaza una contraseña de menos de 6 caracteres', () => {
        expect(
            validatePasswordChange({ ...valid, newPassword: '12345', confirmPassword: '12345' }),
        ).toBe('configuracion.passwordTooShort');
    });

    it('rechaza una confirmación distinta', () => {
        expect(validatePasswordChange({ ...valid, confirmPassword: '654321' })).toBe(
            'configuracion.passwordMismatch',
        );
    });
});
