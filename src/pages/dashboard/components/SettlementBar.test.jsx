import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSettlementStore } from '@/store/use-settlement-store';
import { useSnackbarStore } from '@/store/use-snackbar-store';
import { acceptDialog, buttonNamed, closeDialog, currentDialog } from '@/test/ui-helpers';
import { t } from '@/i18n';
import { SettlementBar, SettlementToggle } from './SettlementBar';

const renderBar = () =>
    render(
        <MemoryRouter initialEntries={['/app/dashboard']}>
            <Routes>
                <Route path="/app/dashboard" element={<SettlementBar totalItems={2} />} />
                <Route path="/app/settlement/:id" element={<p>Detalle del cierre</p>} />
            </Routes>
        </MemoryRouter>,
    );

describe('SettlementBar', () => {
    let finishSession;
    let discardSession;
    let show;

    beforeEach(() => {
        finishSession = vi.fn().mockResolvedValue({ id: 12 });
        discardSession = vi.fn().mockResolvedValue();
        show = vi.fn();
        useSnackbarStore.setState({ show });
        useSettlementStore.setState({
            active: true,
            session: { id: 1 },
            checkedExpenses: { 5: true },
            finishSession,
            discardSession,
        });
    });

    afterEach(() => {
        closeDialog();
        useSettlementStore.setState({ active: false, session: null, checkedExpenses: {} });
    });

    it('no se muestra sin una sesión abierta', () => {
        useSettlementStore.setState({ active: false });

        const { container } = renderBar();

        expect(container).toBeEmptyDOMElement();
    });

    it('sin gastos marcados avisa y no abre el cierre', async () => {
        useSettlementStore.setState({ checkedExpenses: {} });
        const user = userEvent.setup();
        renderBar();

        await user.click(buttonNamed('common.finish'));

        expect(show).toHaveBeenCalledWith(
            t('dashboard.markAtLeastOneExpenseToFinish'),
            'info',
            'playlist_add_check',
        );
        expect(currentDialog()).toBeNull();
        expect(finishSession).not.toHaveBeenCalled();
    });

    it('confirma el cierre y lleva al snapshot', async () => {
        const user = userEvent.setup();
        renderBar();

        await user.click(buttonNamed('common.finish'));
        expect(finishSession).not.toHaveBeenCalled();

        await acceptDialog();

        await waitFor(() => expect(screen.getByText('Detalle del cierre')).toBeInTheDocument());
        expect(finishSession).toHaveBeenCalledOnce();
    });

    it('si el cierre falla se queda en el dashboard', async () => {
        finishSession.mockRejectedValue(new Error('fallo'));
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        const user = userEvent.setup();
        renderBar();

        await user.click(buttonNamed('common.finish'));
        await acceptDialog();

        await waitFor(() => expect(currentDialog()).toBeNull());
        expect(screen.queryByText('Detalle del cierre')).not.toBeInTheDocument();
        consoleError.mockRestore();
    });

    it('descartar pide confirmación', async () => {
        const user = userEvent.setup();
        renderBar();

        await user.click(buttonNamed('common.discard'));
        expect(discardSession).not.toHaveBeenCalled();

        await acceptDialog();

        await waitFor(() => expect(discardSession).toHaveBeenCalledOnce());
    });
});

describe('SettlementToggle', () => {
    afterEach(() => useSettlementStore.setState({ active: false }));

    it('inicia la sesión', async () => {
        const startSession = vi.fn().mockResolvedValue();
        useSettlementStore.setState({ active: false, startSession });
        const user = userEvent.setup();
        render(<SettlementToggle />);

        await user.click(buttonNamed('common.settle'));

        expect(startSession).toHaveBeenCalledOnce();
    });

    it('no se muestra con una sesión abierta', () => {
        useSettlementStore.setState({ active: true });

        const { container } = render(<SettlementToggle />);

        expect(container).toBeEmptyDOMElement();
    });
});
