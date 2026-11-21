import { useCallback, useEffect, useMemo, useState } from 'react';
import useAuth from '@/store/use-auth-store';
import { fetchSettlementSnapshots, fetchSettlementSnapshotById } from '@/services/api';
import { usePusherChannel } from '@/hooks/use-pusher-channel';
import { getIntlLocale } from '@/i18n';

const PAYMENT_STATUS_EVENTS = [
    'pago.confirmado',
    'pago.rechazado',
    'pago.retirado',
    'pago.reversion_solicitada',
    'pago.reversion_cancelada',
    'pago.reversion_aceptada',
    'pago.reversion_rechazada',
];

function usePaymentStatusEvents(userId, onEvent) {
    const events = useMemo(
        () => Object.fromEntries(PAYMENT_STATUS_EVENTS.map((name) => [name, onEvent])),
        [onEvent],
    );
    usePusherChannel(userId ? `compartidos-${userId}` : null, events);
}

export function useSettlementHistoryList() {
    const { token, user } = useAuth();
    const [snapshots, setSnapshots] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(
        async ({ silent = false } = {}) => {
            if (!token) return;
            if (!silent) setLoading(true);
            try {
                const data = await fetchSettlementSnapshots(token);
                setSnapshots(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error cargando snapshots de cuentas:', err);
            } finally {
                if (!silent) setLoading(false);
            }
        },
        [token],
    );

    useEffect(() => {
        load();
    }, [load]);

    const reloadSilently = useCallback(() => load({ silent: true }), [load]);
    usePaymentStatusEvents(user?.id, reloadSilently);

    return { snapshots, loading, reload: load };
}

export function useSettlementDetail(id) {
    const { token, user } = useAuth();
    const [snapshot, setSnapshot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!token || !id) return;
        let alive = true;
        setLoading(true);
        setError(false);
        fetchSettlementSnapshotById(id, token)
            .then((data) => alive && setSnapshot(data))
            .catch((err) => {
                console.error('Error cargando snapshot:', err);
                if (alive) setError(true);
            })
            .finally(() => alive && setLoading(false));
        return () => {
            alive = false;
        };
    }, [id, token]);

    const reloadSilently = useCallback(() => {
        if (!token || !id) return;
        fetchSettlementSnapshotById(id, token)
            .then(setSnapshot)
            .catch((err) => console.error('Error recargando snapshot:', err));
    }, [id, token]);
    usePaymentStatusEvents(user?.id, reloadSilently);

    return { snapshot, loading, error };
}

export function monthLabel(month) {
    if (!month) return '';
    const [y, m] = month.split('-').map(Number);
    if (!y || !m) return month;
    return new Intl.DateTimeFormat(getIntlLocale(), { month: 'long', year: 'numeric' }).format(
        new Date(y, m - 1, 1),
    );
}
