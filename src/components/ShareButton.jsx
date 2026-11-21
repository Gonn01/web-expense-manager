import { useState } from 'react';
import Icon from '@/components/Icon';
import { useSnackbarStore } from '@/store/use-snackbar-store';
import { ShareOutcome, canShareText, shareText } from '@/utils/share-text';
import { ACTION_BUTTON_CLASS, ACTION_BUTTON_SIZES } from './action-button-styles';
import { t } from '@/i18n';

const SUPPORT_PROBE_TEXT = 'Expense Manager';

export default function ShareButton({
    getText,
    label = t('common.share'),
    title = t('common.shareWithAnotherApp'),
    size = 'md',
}) {
    const s = ACTION_BUTTON_SIZES[size] ?? ACTION_BUTTON_SIZES.md;
    const [copied, setCopied] = useState(false);

    if (!canShareText(globalThis.navigator, SUPPORT_PROBE_TEXT)) return null;

    const copyAsFallback = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Error copiando al portapapeles', err);
            useSnackbarStore.getState().show(t('common.theSummaryCouldnTBeSharedOr'), 'error');
        }
    };

    const handleClick = () => {
        const text = getText();
        shareText(text).then((outcome) => {
            if (outcome === ShareOutcome.ERROR || outcome === ShareOutcome.UNAVAILABLE) {
                copyAsFallback(text);
            }
        });
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            title={title}
            aria-label={title}
            className={`${ACTION_BUTTON_CLASS} ${s.button}`}
        >
            <Icon name={copied ? 'check' : 'share'} className={s.icon} />
            {copied ? t('common.copied') : label}
        </button>
    );
}
