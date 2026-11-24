import { screen } from '@testing-library/react';
import { t } from '@/i18n';
import { useDialogStore } from '@/store/use-dialog-store';

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const buttonNamed = (key) =>
    screen.getByRole('button', { name: new RegExp(`${escapeRegExp(t(key))}$`) });

export const currentDialog = () => useDialogStore.getState().current;

export const acceptDialog = () => useDialogStore.getState().accept();

export const closeDialog = () => useDialogStore.getState().close(false);
