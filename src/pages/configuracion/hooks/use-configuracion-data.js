import { useEffect, useState, useCallback } from 'react';
import useAuth from '@/store/use-auth-store';
import { updatePreferredCurrency, updateSueldo } from '@/services/api';
import { Currency } from '@/utils/enums';

const CURRENCY_VALUES = Object.values(Currency);

export function useConfiguracionData() {
    const { user, token, updateUser } = useAuth();

    const [preview, setPreview] = useState('');
    const [nombreVisible, setNombreVisible] = useState('Usuario');

    useEffect(() => {
        if (!user) return;
        setPreview(user.avatar || '');
        setNombreVisible(user.name || user.nombre || 'Usuario');
    }, [user]);

    const monedaActual = CURRENCY_VALUES.includes(user?.preferred_currency)
        ? user.preferred_currency
        : Currency.ARS;

    const sueldoActual = user?.sueldo ?? '';
    const sueldoMonedaActual = CURRENCY_VALUES.includes(user?.sueldo_currency)
        ? user.sueldo_currency
        : monedaActual;

    const guardarMoneda = useCallback(
        async (moneda) => {
            if (!user?.id) throw new Error('No se encontró el ID de usuario.');

            const updated = await updatePreferredCurrency(moneda, token);
            updateUser({ ...updated, preferred_currency: moneda, monedaPreferida: moneda });
        },
        [user, token, updateUser],
    );

    const guardarSueldo = useCallback(
        async (sueldoNumber, sueldoCurrency) => {
            if (!user?.id) throw new Error('No se encontró el ID de usuario.');

            const updated = await updateSueldo(sueldoNumber, sueldoCurrency, token);
            updateUser({ ...updated, sueldo: sueldoNumber, sueldo_currency: sueldoCurrency });
        },
        [user, token, updateUser],
    );

    return {
        user,
        preview,
        nombreVisible,
        monedaActual,
        sueldoActual,
        sueldoMonedaActual,
        guardarMoneda,
        guardarSueldo,
    };
}
