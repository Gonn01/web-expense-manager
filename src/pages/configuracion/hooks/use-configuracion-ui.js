import { useEffect, useState } from 'react';
import { useDialogStore } from '@/store/use-dialog-store';
import { useUIStore } from '@/store/use-ui-store';
import { useOnboardingStore } from '@/store/use-onboarding-store';
import { useConfiguracionData } from './use-configuracion-data';
import { getLanguagePreference, setLanguagePreference, t } from '@/i18n';

export function useConfiguracionUI() {
    const {
        user,
        preview,
        nombreVisible,
        monedaActual,
        sueldoActual,
        sueldoMonedaActual,
        guardarMoneda,
        guardarSueldo,
        hasPassword,
        guardarPassword,
        cerrarTodasLasSesiones,
    } = useConfiguracionData();

    const themeMode = useUIStore((s) => s.themeMode);
    const setThemeMode = useUIStore((s) => s.setThemeMode);
    const openOnboarding = useOnboardingStore((s) => s.openOnboarding);

    const onOpenTutorial = () => openOnboarding(user?.id);

    const [moneda, setMoneda] = useState(monedaActual);
    const [sueldo, setSueldo] = useState(sueldoActual === '' ? '' : String(sueldoActual));
    const [sueldoMoneda, setSueldoMoneda] = useState(sueldoMonedaActual);
    const [loadingMoneda, setLoadingMoneda] = useState(false);
    const [loadingSueldo, setLoadingSueldo] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [snackbar, setSnackbar] = useState(null);
    const [languagePreference, setLanguagePreferenceState] = useState(getLanguagePreference);

    const onChangeLanguage = (preference) => {
        setLanguagePreference(preference);
        setLanguagePreferenceState(getLanguagePreference());
    };

    useEffect(() => {
        setMoneda(monedaActual);
    }, [monedaActual]);

    useEffect(() => {
        setSueldo(sueldoActual === '' ? '' : String(sueldoActual));
    }, [sueldoActual]);

    useEffect(() => {
        setSueldoMoneda(sueldoMonedaActual);
    }, [sueldoMonedaActual]);

    const showSnackbar = (message, type = 'success') => setSnackbar({ message, type });
    const closeSnackbar = () => setSnackbar(null);

    const onSaveMoneda = async () => {
        try {
            setLoadingMoneda(true);
            await guardarMoneda(moneda);
            showSnackbar(t('configuracion.preferredCurrencyUpdated'));
        } catch (err) {
            console.error('Error guardando configuración:', err);
        } finally {
            setLoadingMoneda(false);
        }
    };

    const onSaveSueldo = async () => {
        const sueldoNumber = Number(sueldo);

        if (sueldo === '' || !Number.isFinite(sueldoNumber) || sueldoNumber < 0) {
            showSnackbar(t('configuracion.enterAValidSalaryANumberGreater'), 'error');
            return;
        }

        try {
            setLoadingSueldo(true);
            await guardarSueldo(sueldoNumber, sueldoMoneda);
            showSnackbar(t('configuracion.salaryUpdated'));
        } catch (err) {
            console.error('Error guardando sueldo:', err);
        } finally {
            setLoadingSueldo(false);
        }
    };

    const onSavePassword = async (passwords) => {
        try {
            setLoadingPassword(true);
            await guardarPassword(passwords);
            showSnackbar(t('configuracion.passwordUpdated'));
            return true;
        } catch (err) {
            console.error('Error guardando contraseña:', err.code);
            return false;
        } finally {
            setLoadingPassword(false);
        }
    };

    const onRevokeSessions = () =>
        useDialogStore.getState().confirm({
            title: t('configuracion.revokeSessionsConfirmTitle'),
            message: t('configuracion.revokeSessionsConfirmMessage'),
            tone: 'danger',
            confirmLabel: t('configuracion.revokeSessionsAction'),
            onConfirm: cerrarTodasLasSesiones,
        });

    return {
        user,
        preview,
        nombreVisible,

        moneda,
        setMoneda,
        loadingMoneda,
        onSaveMoneda,

        sueldo,
        setSueldo,
        sueldoMoneda,
        setSueldoMoneda,
        loadingSueldo,
        onSaveSueldo,

        hasPassword,
        loadingPassword,
        onSavePassword,
        onRevokeSessions,

        themeMode,

        setThemeMode,

        languagePreference,
        onChangeLanguage,

        onOpenTutorial,

        snackbar,

        closeSnackbar,
    };
}
