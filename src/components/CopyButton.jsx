import { useState } from 'react';
import Icon from '@/components/Icon';
import { useSnackbarStore } from '@/store/use-snackbar-store';

const SIZES = {
    md: { button: 'gap-2 px-4 py-2', icon: '' },
    sm: { button: 'gap-1.5 px-2.5 py-1.5 text-xs shrink-0', icon: 'text-sm' },
};

export default function CopyButton({
    getText,
    label = 'Copiar',
    title = 'Copiar al portapapeles',
    size = 'md',
}) {
    const s = SIZES[size] ?? SIZES.md;
    const [copied, setCopied] = useState(false);

    const handleClick = async () => {
        try {
            await navigator.clipboard.writeText(getText());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Error copiando al portapapeles', err);
            useSnackbarStore.getState().show('No se pudo copiar al portapapeles.', 'error');
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            title={title}
            className={`flex items-center ${s.button} bg-primary/20 hover:bg-primary/30 transition-colors rounded-lg text-primary font-bold cursor-pointer`}
        >
            <Icon name={copied ? 'check' : 'content_copy'} className={s.icon} />
            {copied ? '¡Copiado!' : label}
        </button>
    );
}
