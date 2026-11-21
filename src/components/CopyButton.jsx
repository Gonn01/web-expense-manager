import { useState } from 'react';
import Icon from '@/components/Icon';
import { useSnackbarStore } from '@/store/use-snackbar-store';
import { ACTION_BUTTON_CLASS, ACTION_BUTTON_SIZES } from './action-button-styles';
import { t } from '@/i18n';

export default function CopyButton({
    getText,
    label = t('common.copy'),
    title = t('common.copyToClipboard'),
    size = 'md',
    onCopied,
}) {
    const s = ACTION_BUTTON_SIZES[size] ?? ACTION_BUTTON_SIZES.md;
    const [copied, setCopied] = useState(false);

    const handleClick = async () => {
        try {
            await navigator.clipboard.writeText(getText());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            onCopied?.();
        } catch (err) {
            console.error('Error copiando al portapapeles', err);
            useSnackbarStore.getState().show(t('common.couldnTCopyToClipboard'), 'error');
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            title={title}
            className={`${ACTION_BUTTON_CLASS} ${s.button}`}
        >
            <Icon name={copied ? 'check' : 'content_copy'} className={s.icon} />
            {copied ? t('common.copied') : label}
        </button>
    );
}
