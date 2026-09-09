import { useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/Icon';
import useAuth from '@/store/use-auth-store';

/**
 * Botón de la página de detalle de entidad que se alterna entre
 * "Vincular usuario" y el usuario ya vinculado. Ambas acciones se
 * confirman mediante un dialog de alerta.
 */
export default function LinkUserButton({ entity, onVincular, onDesvincular, loading = false }) {
    const isLinked = !!entity?.linked_user_id;
    const currentUserEmail = useAuth((s) => s.user?.email);
    const [dialog, setDialog] = useState(null); // 'link' | 'unlink' | null
    const [emailInput, setEmailInput] = useState('');
    const [error, setError] = useState('');

    const isSelfEmail =
        !!currentUserEmail &&
        emailInput.trim().toLowerCase() === currentUserEmail.trim().toLowerCase();

    const closeDialog = () => {
        if (loading) return;
        setDialog(null);
        setEmailInput('');
        setError('');
    };

    const handleVincular = async () => {
        if (!emailInput.trim() || isSelfEmail) return;
        setError('');
        try {
            await onVincular(emailInput.trim());
            closeDialog();
        } catch (err) {
            setError(err?.response?.data?.error || 'Error al vincular usuario');
        }
    };

    const handleDesvincular = async () => {
        setError('');
        try {
            await onDesvincular();
            closeDialog();
        } catch (err) {
            setError(err?.response?.data?.error || 'Error al desvincular usuario');
        }
    };

    return (
        <>
            {isLinked ? (
                <button
                    type="button"
                    onClick={() => setDialog('unlink')}
                    disabled={loading}
                    title="Desvincular usuario"
                    className="flex items-center gap-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 px-4 py-2 rounded-lg font-bold text-zinc-700 dark:text-white cursor-pointer disabled:opacity-50"
                >
                    <Icon name="link" />
                    <span className="max-w-[12rem] truncate">
                        {entity.linked_user_name || entity.linked_user_email || 'Usuario vinculado'}
                    </span>
                </button>
            ) : (
                <button
                    type="button"
                    onClick={() => setDialog('link')}
                    disabled={loading}
                    className="flex items-center gap-2 bg-primary/20 hover:bg-primary/30 px-4 py-2 rounded-lg text-primary font-bold cursor-pointer disabled:opacity-50"
                >
                    <Icon name="person_add" />
                    Vincular usuario
                </button>
            )}

            {dialog &&
                createPortal(
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-sm rounded-xl bg-white dark:bg-zinc-900 border dark:border-zinc-700 shadow-xl p-6">
                            {dialog === 'link' ? (
                                <>
                                    <h3 className="text-lg font-bold mb-2 dark:text-white flex items-center gap-2">
                                        <Icon name="link" className="text-base" />
                                        Vincular usuario
                                    </h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                                        Ingresá el email del usuario. Los gastos de esta entidad se
                                        compartirán automáticamente con él.
                                    </p>
                                    <input
                                        type="email"
                                        placeholder="Email del usuario"
                                        value={emailInput}
                                        disabled={loading}
                                        autoFocus
                                        onChange={(e) => {
                                            setEmailInput(e.target.value);
                                            setError('');
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleVincular()}
                                        className="w-full px-3 py-2 rounded-lg border dark:border-zinc-700 bg-transparent dark:text-white text-sm disabled:opacity-60"
                                    />
                                    {isSelfEmail && (
                                        <p className="text-xs text-red-500 mt-2">
                                            No podés vincular tu propia cuenta.
                                        </p>
                                    )}
                                </>
                            ) : (
                                <>
                                    <h3 className="text-lg font-bold mb-2 dark:text-white flex items-center gap-2">
                                        <Icon name="link_off" className="text-base text-red-500" />
                                        Desvincular usuario
                                    </h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                                        ¿Seguro que querés desvincular a{' '}
                                        <span className="font-medium text-zinc-700 dark:text-zinc-200">
                                            {entity.linked_user_name ||
                                                entity.linked_user_email ||
                                                'este usuario'}
                                        </span>
                                        ? Los nuevos gastos dejarán de compartirse automáticamente.
                                    </p>
                                </>
                            )}

                            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={closeDialog}
                                    disabled={loading}
                                    className="px-4 py-2 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-black dark:text-white text-sm disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={dialog === 'link' ? handleVincular : handleDesvincular}
                                    disabled={
                                        loading ||
                                        (dialog === 'link' && (!emailInput.trim() || isSelfEmail))
                                    }
                                    className={`px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-1 disabled:opacity-50 ${
                                        dialog === 'link'
                                            ? 'bg-primary'
                                            : 'bg-red-600 hover:bg-red-700'
                                    }`}
                                >
                                    {loading && (
                                        <Icon
                                            name="progress_activity"
                                            className="animate-spin text-sm"
                                        />
                                    )}
                                    {dialog === 'link' ? 'Vincular' : 'Desvincular'}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
        </>
    );
}
