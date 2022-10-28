import type { SWRConfiguration } from 'swr/dist/types';
import { useCallback } from 'react';
import useSWR, { Key, useSWRConfig } from 'swr';

/**
 * Based on `MutatorCallback<Data = any>` from swr
 */
export type StateMutatorCallback<T = any> = (currentData: T) => T|Promise<T|undefined>;

/**
 * Based on `KeyedMutator<Data>` from swr
 */
export type StateMutator<T> = (data?: T|StateMutatorCallback<T>) => void;

/**
 * Type for params `useStore` hooks
 * @param key unique string that will become a key to get the cache data
 * @param initial starter value if there no cached state on client
 * @param persist object to handle custom cache, it consits `onSetData` and `onGetData` callback.
 * @see https://github.com/gadingnst/swr-global-state#create-a-store-object
 */
export interface StoreParams<T> {
  key: Key|string;
  initial: T;
  persist?: {
    onSetData: (key: Key|string, data: T, isServer?: boolean) => void|Promise<void>;
    onGetData: (key: Key|string, isServer?: boolean) => T|Promise<T|undefined>;
  };
}

/**
 * Check current environment is on server or not.
 * @param w current window
 * @returns {boolean} current environment is on server or not
 */
const isServer = (w: Window & typeof globalThis): boolean => typeof w === 'undefined';

/**
 * Using global state with SWR helpers
 * @param {StoreParams<T>} data state that to be shared or cached
 * @see https://github.com/gadingnst/swr-global-state#create-a-store-object for example usage
 */
export function useStore<T>(data: StoreParams<T>, swrConfig?: SWRConfiguration) {
  const {
    key,
    initial,
    persist
  } = data;

  const { cache } = useSWRConfig();
  const { data: state, mutate, ...otherSWRResponse } = useSWR<T>(key, () => (
    cache.get(key) ?? persist?.onGetData(key, isServer(window))
  ), {
    fallbackData: cache.get(key) ?? initial,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    ...swrConfig
  });

  /**
   * State setter, use this to set the global state like `setState` from `useState` hooks.
   * Can use callback function to get previous state and use it to set the state.
   * @param {T|StateMutatorCallback<T>}
   * @returns {StateMutator<T>} SWR Mutation
   * @see https://github.com/gadingnst/swr-global-state#using-store-on-your-component-1
   */
  const setState: StateMutator<T> = useCallback(async(data?: T|StateMutatorCallback<T>) => {
    const newState = typeof data !== 'function'
      ? data
      : await (data as StateMutatorCallback)(state);
    persist?.onSetData(key, newState, isServer(window));
    mutate(newState);
  }, [key, state, persist?.onSetData]);

  return [state as T, setState, otherSWRResponse] as const;
}

/**
 * Create custom hooks that wraps `useStore` to another function.
 * @param {StoreParams<T>} data state that to be shared or cached
 * @see https://github.com/gadingnst/swr-global-state#best-practice for example best practice usage
 */
export function createStore<T>(data: StoreParams<T>, swrConfig?: SWRConfiguration) {
  return () => useStore(data, swrConfig);
}

export default useStore;
