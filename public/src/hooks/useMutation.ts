// src/hooks/useMutation.ts
import { useState } from 'react';
import axiosClient from '../api/axiosClient';

interface MutationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseMutationOptions<TResponse> {
  onSuccess?: (data: TResponse) => void;
  onError?: (error: string) => void;
}

type Method = 'post' | 'put' | 'delete';
type UrlParam<TParam> = string | ((param: TParam) => string);

export const useMutation = <
  TRequest = any,
  TResponse = any,
  TParam = any
>(
  url: UrlParam<TParam>,
  method: Method = 'post',
  options?: UseMutationOptions<TResponse>
) => {
  const [state, setState] = useState<MutationState<TResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = async (payload?: TRequest, param?: TParam): Promise<TResponse> => {
    setState({ data: null, loading: true, error: null });

    try {
      // Allow flexible argument ordering for mutate to support both common call styles
      // 1) mutate(payload, param)  (payload first, param second) - original
      // 2) mutate(param, payload)  (param first, payload second) - used across forms in this codebase
      let finalPayload: any = payload as any;
      let finalParam: any = param as any;

      if (typeof url === 'function') {
        // case: mutate(id) -> treat single primitive arg as param
        if (param === undefined && payload !== undefined && (typeof payload === 'string' || typeof payload === 'number')) {
          finalParam = payload as any;
          finalPayload = undefined;
        }

        // case: mutate(id, data) where first arg is param and second is payload
        if (payload !== undefined && param !== undefined && (typeof payload === 'string' || typeof payload === 'number') && typeof param === 'object') {
          finalParam = payload as any;
          finalPayload = param as any;
        }
      }

      const finalUrl = typeof url === 'function' ? url(finalParam) : url;

      let config: any = {};
      let response;

      // ✅ Detect FormData and adjust headers/method for backend compatibility
      const isFormData = typeof FormData !== 'undefined' && finalPayload instanceof FormData;
      if (isFormData) {
        config.headers = {
          // Let browser set multipart boundary
          'Content-Type': 'multipart/form-data',
        };
      }

      switch (method) {
        case 'post':
          response = await axiosClient.post<TResponse>(finalUrl, finalPayload, config);
          break;
        case 'put':
          // Some backends (e.g. Laravel) do not populate multipart form data on PUT requests.
          // When sending FormData for updates, fallback to POST with _method=PUT so server can read fields.
          if (isFormData && finalPayload instanceof FormData) {
            try {
              finalPayload.append('_method', 'PUT');
            } catch (e) {
              // ignore
            }
            response = await axiosClient.post<TResponse>(finalUrl, finalPayload, config);
          } else {
            response = await axiosClient.put<TResponse>(finalUrl, finalPayload, config);
          }
          break;
        case 'delete':
          response = await axiosClient.delete<TResponse>(finalUrl, { data: finalPayload });
          break;
      }

      const responseData = response?.data;
      setState({ data: responseData ?? null, loading: false, error: null });
      if (options?.onSuccess) options.onSuccess(responseData);
      return responseData;
    } catch (err: any) {
      console.error('API Mutation Error:', err.response || err);
      const errorMsg = err.response?.data?.message || err.message || 'Something went wrong';
      setState({ data: null, loading: false, error: errorMsg });
      if (options?.onError) options.onError(errorMsg);
      throw err;
    }
  };

  return { ...state, mutate };
};
