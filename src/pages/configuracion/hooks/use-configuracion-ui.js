import { useEffect, useState } from 'react';
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

        themeMode,

        setThemeMode,

        languagePreference,
        onChangeLanguage,

        onOpenTutorial,

        snackbar,

        closeSnackbar,
    };
}
