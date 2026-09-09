import GlobalSnackbar from '@/components/GlobalSnackbar';
import GlobalDialog from '@/components/GlobalDialog';

/**
 * Feedback global de la app (snackbars + dialogs de error). Se monta una sola
 * vez, arriba de todo, para que funcione en cualquier ruta (incluido login).
 */
export default function GlobalFeedback() {
    return (
        <>
            <GlobalSnackbar />
            <GlobalDialog />
        </>
    );
}
