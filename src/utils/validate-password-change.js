export const MIN_PASSWORD_LENGTH = 6;

export function validatePasswordChange({
    hasPassword,
    currentPassword,
    newPassword,
    confirmPassword,
}) {
    if (hasPassword && !currentPassword) return 'configuracion.passwordCurrentRequired';
    if (newPassword.length < MIN_PASSWORD_LENGTH) return 'configuracion.passwordTooShort';
    if (newPassword !== confirmPassword) return 'configuracion.passwordMismatch';
    return null;
}
