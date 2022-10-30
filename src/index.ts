import type { MutatorOptions, SWRConfiguration } from 'swr/dist/types';
import { useCallback } from 'react';
import useSWR, { Key, useSWRConfig } from 'swr';

/** Based on `Key` from swr*/
export type StateKey = Key;

/** Based on `MutatorCallback<Data = any>` from swr*/
export type StateMutatorCallback<T> = (currentData: T) => T|Promise<T>;

/** Based on `KeyedMutator<Data>` from swr */
export type StateMutator<T> = (data: T|StateMutatorCallback<T>, opts?: boolean | MutatorOptions<T>) => void;

/** Object to handle custom cache, it consits `onSet` and `onGet` callback. */
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

/**
 * Type for params `useStore` hooks
 * @see https://github.com/gadingnst/swr-global-state#create-a-store-object
 */
export interface StoreParams<T> {
  /** @param key is unique data type (or usually string) that will a key for the data  */
  key: StateKey;
  /** @param initial is starter value if there no cached state on client */
  initial: T;
  /** @param persistor is object to handle custom cache, it consits `onSet` and `onGet` callback. */
  persistor?: StatePersistor<T>;
}

/**
 * Using global state with SWR helpers
 * @param {StoreParams<T>} data state that to be shared or cached
 * @see https://github.com/gadingnst/swr-global-state#create-a-store-object for example usage
 */
export function useStore<T, E = any>(data: StoreParams<T>, swrConfig?: SWRConfiguration) {
  const {
    key,
    initial,
    persistor
  } = data;

  const { cache } = useSWRConfig();
  const swrResponse = useSWR<T, E>(
    key,
    () => Promise.resolve(persistor?.onGet(key) as T)
      .then(resolvedData => resolvedData ?? cache.get(key) ?? initial),
    {
      fallbackData: initial,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      ...swrConfig
    }
  );

  const { data: state, mutate } = swrResponse;

  /**
   * State setter, use this to set the global state like `setState` from `useState` hooks.
   * Can use callback function to get previous state and use it to set the state.
   * @param {T|StateMutatorCallback<T>}
   * @returns {StateMutator<T>} SWR Mutation
   * @see https://github.com/gadingnst/swr-global-state#using-store-on-your-component-1
   */
  const setState: StateMutator<T> = useCallback((data: T|StateMutatorCallback<T>, opts?: boolean|MutatorOptions<T>) => mutate(() => {
    const setPersist = (newState: T) => persistor?.onSet(key, newState as T);
    if (typeof data !== 'function') {
      setPersist(data);
      return data;
    }
    const mutatorCallback = data as StateMutatorCallback<T>;
    return Promise.resolve(mutatorCallback(state as T))
      .then((newData) => {
        setPersist(newData);
        return newData;
      });
  }, opts), [key, state, persistor?.onSet]);

  return [
    state as T,
    setState,
    swrResponse
  ] as const;
}

/**
 * Create custom hooks that wraps `useStore` to another function.
 * @param {StoreParams<T>} data state that to be shared or cached
 * @see https://github.com/gadingnst/swr-global-state#best-practice for example best practice usage
 */
export function createStore<T, E = any>(data: StoreParams<T>, swrConfig?: SWRConfiguration) {
  return () => useStore<T, E>(data, swrConfig);
}

export default useStore;
