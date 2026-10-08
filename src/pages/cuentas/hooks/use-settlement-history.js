import { useCallback, useEffect, useState } from 'react';
import useAuth from '@/store/use-auth-store';
import { fetchSettlementSnapshots, fetchSettlementSnapshotById } from '@/services/api';

export function useSettlementHistoryList() {
    const { token } = useAuth();
    const [snapshots, setSnapshots] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const data = await fetchSettlementSnapshots(token);
            setSnapshots(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error cargando snapshots de cuentas:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        load();
    }, [load]);

    return { snapshots, loading, reload: load };
}

export function useSettlementDetail(id) {
    const { token } = useAuth();
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

    return { snapshot, loading, error };
}

const MONTH_FMT = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' });

/** 'YYYY-MM' -> 'agosto 2026' */
export function monthLabel(month) {
    if (!month) return '';
    const [y, m] = month.split('-').map(Number);
    if (!y || !m) return month;
    return MONTH_FMT.format(new Date(y, m - 1, 1));
}
