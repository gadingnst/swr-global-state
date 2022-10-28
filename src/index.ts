import type { SWRConfiguration } from 'swr/dist/types';
import { useCallback } from 'react';
import useSWR, { Key, useSWRConfig } from 'swr';

/**
 * Based on `MutatorCallback<Data = any>` from swr
 */
export type StateMutatorCallback<T = any> = (currentData: T) => Promise<T|undefined>;

/**
 * Based on `KeyedMutator<Data>` from swr
 */
export type StateMutator<T> = (data?: T|StateMutatorCallback<T>) => void;

/**
 * Type for returns from `useStore` hooks.
 * @see https://github.com/gadingnst/swr-global-state#example-custom-hooks-with-typescript for example case
 */
export type Store<T, K = T>= readonly [T, StateMutator<K>];

/**
 * Type for return wrapper function that wraps `Store<T, K>`
 * @see https://github.com/gadingnst/swr-global-state#example-custom-hooks-with-typescript for example case
 */
export type StoreHooks<T, K = T> = () => Store<T, K>;

/**
 * Type for params `useStore` hooks
 * @param key unique string that will become a key to get the cache data
 * @param initial starter value if there no cached state on client
 * @param persist object to handle custom cache, it consits `onSetData` and `onGetData` callback.
 * @see https://github.com/gadingnst/swr-global-state#create-a-store-object
 */
export interface StoreParams<T> {
  key: Key;
  initial: T;
  persist?: {
    onSetData: (key: Key, data: T, isServer?: boolean) => Promise<void>;
    onGetData: (key: Key, isServer?: boolean) => Promise<T|undefined>;
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
 * @returns {Store<T>} state and setter
 * @see https://github.com/gadingnst/swr-global-state#create-a-store-object for example usage
 */
export function useStore<T>(data: StoreParams<T>, swrConfig?: SWRConfiguration): Store<T> {
  const {
    key,
    initial,
    persist
  } = data;

  const { cache } = useSWRConfig();
  const { data: state, mutate } = useSWR<T>(key, () => (
    cache.get(key)
      ?? persist?.onGetData(key, isServer(window))
      ?? initial
  ), swrConfig);

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
  }, [key, state, persist]);

  return [state as T, setState] as const;
}

/**
 * Create custom hooks that wraps `useStore` to another function.
 * @param {StoreParams<T>} data state that to be shared or cached
 * @returns {StoreHooks<T>} state and setter
 * @see https://github.com/gadingnst/swr-global-state#best-practice for example best practice usage
 */
export function createStore<T>(data: StoreParams<T>, swrConfig?: SWRConfiguration): StoreHooks<T> {
  return () => useStore(data, swrConfig);
}

export default useStore;
