import { useRef, useCallback, useState, useMemo, useEffect } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import type { Key, SWRConfiguration, SWRResponse, MutatorOptions } from 'swr';
import { createRateLimitedFunctionWithCleanup, type RateLimitConfig } from './utils';

export type StateKey = Key;
export type StateMutatorCallback<T> = (currentData: T) => T|Promise<T>;
export type StateMutator<T> = (data: T|StateMutatorCallback<T>, opts?: boolean|MutatorOptions<T>) => void;

/**
 * Object to handle custom cache, it consits `onSet` and `onGet` callback.
 * @see https://github.com/gadingnst/swr-global-state#persisted-state
 */
export type StatePersistor<T = any> = {
  /**
   * `onSet` means the callback that to be called when state has triggers changes.
   * Exampe: use this to set the data to `localStorage` every state changes.
   * @param {StateKey} key is data key
   * @param {T} data is new data that has to changed
   */
  onSet: (key: StateKey, data: T) => void|Promise<void>;
  /**
   * `onGet` means the callback that to be called when initial renders.
   * Example: use this to get the data from `localStorage`.
   * @param {StateKey} key is data key
   * @returns {T|Promise<T>} data to be get on initial render
   */
  onGet: (key: StateKey) => T|Promise<T>;
};

export interface StoreParams<T> {
  key: StateKey;
  initial: T;
  persistor?: StatePersistor<T>;
  onError?: (error: Error) => void;
  retryOnError?: boolean;
  rateLimit?: RateLimitConfig<T>;
}

/**
 * Using global state with SWR helpers
 * @param {StoreParams<T>} data state that to be shared or cached
 * @see https://github.com/gadingnst/swr-global-state#custom-hooks for example custom hooks usage
 */
export function useStore<T, E = any>(
  data: StoreParams<T>,
  swrConfig?: SWRConfiguration
): readonly [
  T,
  StateMutator<T>,
  SWRResponse<T, E> & {
    isLoading: boolean;
    error: E;
    isPersisting: boolean;
  }
] {
  const {
    key,
    initial,
    persistor,
    onError,
    retryOnError = true,
    rateLimit
  } = data;

  const cacheKey = useMemo(() => key?.toString() || '', [key]);
  const { cache } = useSWRConfig();
  const rateLimitedPersistRef = useRef<{
    func: (key: StateKey, data: T) => void;
    cleanup: () => void;
  } | null>(null);
  const [isPersisting, setIsPersisting] = useState(false);

  const createRateLimitedPersist = useCallback(() => {
    if (!persistor?.onSet || !rateLimit) return null;

    const persistFunction = async(key: StateKey, data: T) => {
      try {
        await Promise.resolve(persistor.onSet(key, data));
      } catch (error) {
        onError?.(error as Error);
        if (!retryOnError) {
          throw error;
        }
      }
    };

    return createRateLimitedFunctionWithCleanup(
      persistFunction,
      rateLimit,
      () => setIsPersisting(true),
      () => setIsPersisting(false)
    );
  }, [persistor?.onSet, rateLimit, onError, retryOnError]);

  // Initialize rate limited persist function dengan proper cleanup
  useEffect(() => {
    if (rateLimit && !rateLimitedPersistRef.current) {
      const rateLimitedPersist = createRateLimitedPersist();
      if (rateLimitedPersist) {
        rateLimitedPersistRef.current = {
          func: rateLimitedPersist.rateLimitedFunc,
          cleanup: rateLimitedPersist.cleanup
        };
      }
    }

    // Cleanup function
    return () => {
      if (rateLimitedPersistRef.current) {
        rateLimitedPersistRef.current.cleanup();
        rateLimitedPersistRef.current = null;
      }
    };
  }, [rateLimit, createRateLimitedPersist]);

  const swrFetcher = useCallback(async() => {
    try {
      const currentCacheData = cache.get(cacheKey)?.data;

      if (persistor?.onGet) {
        if (currentCacheData === undefined) {
          const persistedData = await Promise.resolve(persistor.onGet(key));
          return persistedData ?? initial;
        }
        return currentCacheData;
      }
      return currentCacheData ?? initial;
    } catch (error) {
      onError?.(error as Error);
      if (retryOnError) {
        throw error;
      }
      return cache.get(cacheKey)?.data ?? initial;
    }
  }, [cache, cacheKey, persistor?.onGet, key, initial, onError, retryOnError]);

  const swrResponse = useSWR(key, swrFetcher, {
    fallbackData: initial,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    ...swrConfig
  });

  const { data: state, mutate, error, isLoading } = swrResponse;

  const setState: StateMutator<T> = useCallback(async(data: T|StateMutatorCallback<T>, opts?: boolean|MutatorOptions<T>) => {
    return mutate(async(currentData: T | undefined) => {
      const actualCurrentData = currentData ?? cache.get(cacheKey)?.data ?? state;

      const setPersist = async(newState: T) => {
        if (persistor?.onSet) {
          if (rateLimitedPersistRef.current) {
            // Use rate limited persist
            rateLimitedPersistRef.current.func(key, newState);
          } else {
            // Immediate persist for non-rate-limited operations
            try {
              await Promise.resolve(persistor.onSet(key, newState));
            } catch (error) {
              onError?.(error as Error);
              if (!retryOnError) {
                throw error;
              }
            }
          }
        }
      };

      if (typeof data !== 'function') {
        await setPersist(data);
        return data;
      }

      const mutatorCallback = data as StateMutatorCallback<T>;
      const newData = await Promise.resolve(mutatorCallback(actualCurrentData as T));
      await setPersist(newData);
      return newData;
    }, opts);
  }, [mutate, key, persistor?.onSet, onError, retryOnError, cacheKey]);

  const returnObject = useMemo(() => ({
    ...swrResponse,
    isLoading,
    error,
    isPersisting
  }), [swrResponse, isLoading, error, isPersisting]);

  return [
    state as T,
    setState,
    returnObject as SWRResponse<T, E> & { isLoading: boolean; error: E; isPersisting: boolean; }
  ] as const;
}

export default useStore;
