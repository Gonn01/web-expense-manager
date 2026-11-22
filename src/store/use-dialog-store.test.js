import { beforeEach, describe, expect, it } from 'vitest';
import { useDialogStore } from './use-dialog-store';

function deferred() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

describe('useDialogStore con onConfirm', () => {
    beforeEach(() => {
        useDialogStore.setState({ current: null });
    });

    it('queda abierto y bloqueado hasta que termina la acción', async () => {
        const action = deferred();
        const result = useDialogStore.getState().confirm({ onConfirm: () => action.promise });

        const accepting = useDialogStore.getState().accept();
        expect(useDialogStore.getState().current.busy).toBe(true);

        useDialogStore.getState().close(false);
        expect(useDialogStore.getState().current).not.toBeNull();

        action.resolve();
        await accepting;

        expect(useDialogStore.getState().current).toBeNull();
        await expect(result).resolves.toBe(true);
    });

    it('se cierra y resuelve false si la acción falla', async () => {
        const action = deferred();
        const result = useDialogStore.getState().confirm({ onConfirm: () => action.promise });

        const accepting = useDialogStore.getState().accept();
        action.reject(new Error('fallo'));
        await accepting;

        expect(useDialogStore.getState().current).toBeNull();
        await expect(result).resolves.toBe(false);
    });
});
