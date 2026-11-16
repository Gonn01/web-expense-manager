import Snackbar from '@/components/Snackbar';
import { useSnackbarStore } from '@/store/use-snackbar-store';

export default function GlobalSnackbar() {
    const current = useSnackbarStore((s) => s.current);
    const hide = useSnackbarStore((s) => s.hide);

    if (!current) return null;

    return (
        <Snackbar
            key={current.id}
            message={current.message}
            type={current.type}
            icon={current.icon}
            onClose={hide}
        />
    );
}
