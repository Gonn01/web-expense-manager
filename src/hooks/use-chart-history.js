import { useCallback, useEffect, useRef, useState } from 'react';
import useAuth from '@/store/use-auth-store';
import { fetchChartHistory } from '@/services/api';

const PAGE_SIZE = 1;

export function useChartHistory(entityId = null, { loadFirstPage = false } = {}) {
    const { token } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [nextBefore, setNextBefore] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const loadingRef = useRef(false);

    const loadMore = useCallback(async () => {
        if (!token || loadingRef.current || (loaded && nextBefore == null)) return;
        loadingRef.current = true;
        setLoadingMore(true);
        try {
            const page = await fetchChartHistory(
                { limit: PAGE_SIZE, before: loaded ? nextBefore : null, entityId },
                token,
            );
            setSessions((prev) => [...prev, ...(page?.sessions ?? [])]);
            setNextBefore(page?.next_before ?? null);
            setLoaded(true);
        } catch {
            return;
        } finally {
            loadingRef.current = false;
            setLoadingMore(false);
        }
    }, [token, loaded, nextBefore, entityId]);

    const autoRequested = useRef(false);
    const [autoLoading, setAutoLoading] = useState(false);
    useEffect(() => {
        if (!loadFirstPage || !token || autoRequested.current) return;
        autoRequested.current = true;
        setAutoLoading(true);
        loadMore().finally(() => setAutoLoading(false));
    }, [loadFirstPage, token, loadMore]);

    return {
        sessions,
        loading: autoLoading,
        loadingMore,
        hasMore: !loaded || nextBefore != null,
        loadMore,
    };
}
