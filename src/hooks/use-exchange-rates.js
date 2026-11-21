import { useEffect, useState } from 'react';
import { parseExchangeRates } from '@/utils/parse-exchange-rates';

const CACHE_DURATION_MS = 5 * 60 * 1000;
const EXCHANGE_RATES_URL = 'https://api.bcra.gob.ar/estadisticascambiarias/v1.0/Cotizaciones';
let _cache = null;
let _cacheTime = null;

export function useExchangeRates() {
    const [rates, setRates] = useState(_cache);
    const [loading, setLoading] = useState(!_cache);

    useEffect(() => {
        if (_cache && _cacheTime && Date.now() - _cacheTime < CACHE_DURATION_MS) {
            setRates(_cache);
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        const fetchRates = async () => {
            setLoading(true);
            try {
                const res = await fetch(EXCHANGE_RATES_URL, {
                    signal: controller.signal,
                });
                if (!res.ok) {
                    throw new Error(`Exchange rates request failed: ${res.status}`);
                }

                const parsed = parseExchangeRates(await res.json());

                _cache = parsed;
                _cacheTime = Date.now();
                setRates(parsed);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error fetching exchange rates:', err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchRates();

        return () => controller.abort();
    }, []);

    return { rates, loading };
}
