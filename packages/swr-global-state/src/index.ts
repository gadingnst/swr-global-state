import useSWR, { useSWRConfig } from 'swr';
import { useRef, useCallback, useState } from 'react';
import type { Key, SWRConfiguration, SWRResponse, MutatorOptions } from 'swr';

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

export type RateLimitType = 'debounce' | 'throttle';

export type RateLimitConfig<T> = {
  type: RateLimitType;
  delay: number;
  // Optional custom function untuk advanced use cases
  customFunction?: (func: (key: StateKey, data: T) => Promise<void>, delay: number) => (key: StateKey, data: T) => void;
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
 * Debounce utility function
 * @param func Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
function debounce<T extends(...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

/**
 * Throttle utility function
 * @param func Function to throttle
 * @param delay Delay in milliseconds
 * @returns Throttled function
 */
function throttle<T extends(...args: any[]) => any>(func: T, delay: number): T {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout;

  return ((...args: any[]) => {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        func(...args);
      }, delay - (now - lastCall));
    }
  }) as T;
}

/**
 * Create rate limited function based on configuration
 * @param func Function to rate limit
 * @param config Rate limit configuration
 * @returns Rate limited function
 */
function createRateLimitedFunction<T>(
  func: (key: StateKey, data: T) => Promise<void>,
  config: RateLimitConfig<T>,
  onStart?: () => void,
  onEnd?: () => void
): (key: StateKey, data: T) => void {
  if (config.customFunction) {
    return config.customFunction(func, config.delay);
  }

  const wrappedFunc = async(key: StateKey, data: T) => {
    onStart?.();
    try {
      await func(key, data);
    } finally {
      onEnd?.();
    }
  };

  switch (config.type) {
    case 'debounce':
      return debounce(wrappedFunc, config.delay);
    case 'throttle':
      return throttle(wrappedFunc, config.delay);
    default:
      return wrappedFunc as any;
  }
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

  const cacheKey = key?.toString() || '';

  const { cache } = useSWRConfig();
  const rateLimitedPersistRef = useRef<((key: StateKey, data: T) => void) | null>(null);
  const [isPersisting, setIsPersisting] = useState(false);

  const createRateLimitedPersist = useCallback(() => {
    if (!persistor?.onSet) return null;

    const effectiveRateLimit = rateLimit;

    if (!effectiveRateLimit) return null;

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

    return createRateLimitedFunction(
      persistFunction,
      effectiveRateLimit,
      () => setIsPersisting(true),
      () => setIsPersisting(false)
    );
  }, [persistor, rateLimit, onError, retryOnError]);

  // Initialize rate limited persist function
  if (!rateLimitedPersistRef.current && (rateLimit)) {
    rateLimitedPersistRef.current = createRateLimitedPersist();
  }

  const swrResponse = useSWR(
    key,
    async() => {
      try {
        // Prioritize current cache data over persisted data
        const currentCacheData = cache.get(cacheKey)?.data;

        if (persistor?.onGet) {
          // Only use persisted data if no current cache data exists
          if (currentCacheData === undefined) {
            const persistedData = await Promise.resolve(persistor.onGet(key));
            return persistedData ?? initial;
          }
          // Return current cache data if it exists
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
    },
    {
      fallbackData: initial,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      ...swrConfig
    }
  );

  const { data: state, mutate, error, isLoading } = swrResponse;

  const setState: StateMutator<T> = async(data: T|StateMutatorCallback<T>, opts?: boolean|MutatorOptions<T>) => {
    return mutate(async(currentData: T | undefined) => {
      // Use currentData from mutate, but if undefined, get fresh data from cache
      const actualCurrentData = currentData ?? cache.get(cacheKey)?.data ?? state;

      const setPersist = async(newState: T) => {
        if (persistor?.onSet) {
          if (rateLimitedPersistRef.current) {
            // Use rate limited persist
            rateLimitedPersistRef.current(key, newState);
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
      // Use actualCurrentData instead of potentially stale state
      const newData = await Promise.resolve(mutatorCallback(actualCurrentData as T));
      await setPersist(newData);
      return newData;
    }, opts);
  };

  return [
    state as T,
    setState,
    { ...swrResponse, isLoading, error, isPersisting } as SWRResponse<T, E> & { isLoading: boolean; error: E; isPersisting: boolean; }
  ] as const;
}

/**
 * Create custom hooks that wraps `useStore` to another function.
 * @param {StoreParams<T>} data state that to be shared or cached
 * @see https://github.com/gadingnst/swr-global-state#creating-a-store
 */
export function createStore<T, E = any>(data: StoreParams<T>, swrConfig?: SWRConfiguration) {
  return (initial?: T) => useStore<T, E>({
    ...data,
    initial: initial ?? data.initial
  }, swrConfig);
}

export default useStore;
