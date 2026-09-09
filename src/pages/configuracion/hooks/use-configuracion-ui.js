import { useEffect, useState } from 'react';
import { useConfiguracionData } from './use-configuracion-data';

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

    const [moneda, setMoneda] = useState(monedaActual);
    const [sueldo, setSueldo] = useState(sueldoActual === '' ? '' : String(sueldoActual));
    const [sueldoMoneda, setSueldoMoneda] = useState(sueldoMonedaActual);
    const [loadingMoneda, setLoadingMoneda] = useState(false);
    const [loadingSueldo, setLoadingSueldo] = useState(false);
    const [snackbar, setSnackbar] = useState(null);

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
            showSnackbar('Moneda preferida actualizada.');
        } catch (err) {
            // El interceptor de axios ya mostró el error.
            console.error('Error guardando configuración:', err);
        } finally {
            setLoadingMoneda(false);
        }
    };

    const onSaveSueldo = async () => {
        const sueldoNumber = Number(sueldo);

        if (sueldo === '' || !Number.isFinite(sueldoNumber) || sueldoNumber < 0) {
            showSnackbar('Ingresá un sueldo válido (número mayor o igual a 0).', 'error');
            return;
        }

        try {
            setLoadingSueldo(true);
            await guardarSueldo(sueldoNumber, sueldoMoneda);
            showSnackbar('Sueldo actualizado.');
        } catch (err) {
            // El interceptor de axios ya mostró el error.
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

        snackbar,
        closeSnackbar,
    };
}
