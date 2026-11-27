import Icon from '@/components/Icon';
import { t } from '@/i18n';

export default function RegistrationNotice({ email, verificationSent }) {
    return (
        <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-3 text-sm text-emerald-800 dark:text-emerald-100"
        >
            <Icon
                name={verificationSent ? 'mark_email_read' : 'check_circle'}
                className="text-emerald-600 dark:text-emerald-300"
            />
            <p className="min-w-0 wrap-break-word">
                {verificationSent
                    ? t('auth.accountCreatedCheckEmail', { email })
                    : t('auth.accountCreated')}
            </p>
        </div>
    );
}
