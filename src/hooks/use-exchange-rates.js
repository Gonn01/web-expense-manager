import { useEffect, useState } from 'react';
import { Currency } from '@/utils/enums';

const CACHE_DURATION_MS = 5 * 60 * 1000;
const FOREIGN_CURRENCIES = Object.values(Currency).filter((c) => c !== Currency.ARS);
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
                const res = await fetch('https://dolarapi.com/v1/cotizaciones', {
                    signal: controller.signal,
                });
                const data = await res.json();

                const parsed = Object.fromEntries(
                    FOREIGN_CURRENCIES.map((cur) => [
                        cur,
                        data.find((d) => d.moneda === cur)?.venta ?? null,
                    ]),
                );

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
