import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

interface UseFetchOptions {
  skip?: boolean;
  cacheKey?: string;
  cacheTime?: number;
  keepPreviousData?: boolean;
  revalidateOnMount?: boolean;
}

const fetchCache = new Map<string, { data: any; timestamp: number }>();

export const useFetch = <T = any>(
  url: string,
  deps: any[] = [],
  options: UseFetchOptions = {}
) => {
  const cacheKey = options.cacheKey || url;
  const cacheTime = options.cacheTime ?? 5 * 60 * 1000;
  const cached = options.cacheKey ? fetchCache.get(cacheKey) : undefined;
  const hasFreshCache = !!cached && Date.now() - cached.timestamp < cacheTime;
  const hasUsableCache = !!cached && (hasFreshCache || options.keepPreviousData);

  const [state, setState] = useState<FetchState<T>>({
    data: hasUsableCache ? cached.data : null,
    loading: !options.skip && !hasUsableCache,
    refreshing: false,
    error: null,
  });

  const fetchData = useCallback(async (force = false) => {
    if (options.skip) return;

    const cachedValue = options.cacheKey ? fetchCache.get(cacheKey) : undefined;
    const cacheIsFresh = !!cachedValue && Date.now() - cachedValue.timestamp < cacheTime;

    if (!force && cacheIsFresh && !options.revalidateOnMount) {
      setState({
        data: cachedValue.data,
        loading: false,
        refreshing: false,
        error: null,
      });
      return;
    }

    setState((prev) => {
      const data = options.keepPreviousData ? prev.data ?? cachedValue?.data ?? null : null;
      return {
        data,
        loading: !data,
        refreshing: !!data,
        error: null,
      };
    });

    try {
      const response = await axiosClient.get<T>(url);
      if (options.cacheKey) {
        fetchCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
      }
      setState({ data: response.data, loading: false, refreshing: false, error: null });
    } catch (err: any) {
      setState((prev) => ({
        data: options.keepPreviousData ? prev.data : null,
        loading: false,
        refreshing: false,
        error: err.response?.data?.message || err.message || 'Something went wrong',
      }));
    }
  }, [url, options.skip, options.cacheKey, options.keepPreviousData, options.revalidateOnMount, cacheKey, cacheTime, ...deps]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Return state + refetch function
  return {
    ...state,
    refetch: () => fetchData(true),
  };
};
