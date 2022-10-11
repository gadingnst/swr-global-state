import { useCallback, useEffect, useRef } from 'react';
import useSWR, { Key, useSWRConfig } from 'swr';
import { hasValue } from './utils';

/**
 * Based on `MutatorCallback<Data = any>` from swr
 */
export type StateMutatorCallback<T = any> = (currentData: T) => T|undefined;

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
 * @see https://github.com/gadingnst/swr-global-state#create-a-store-object
 */
export interface StoreParams<T> {
  key: Key;
  initial: T;
  persist?: boolean;
}

/**
 * check is window is support local storage
 * @param persist
 * @returns {boolean} boolean if cache is supported
 */
const isSupportPersistance = (persist?: boolean): boolean =>
  window.localStorage && !!persist;

/**
 * get cached value from local storage
 * @param key store key
 * @returns {T} parsed persisted state
 */
const getCache = <T = any>(key: Key): T => {
  const cache = window.localStorage.getItem(key as string) ?? 'null';
  try {
    return JSON.parse(cache);
  } catch {
    return cache as unknown as T;
  }
};

/**
 * cache the value into local storage
 * @param key store key
 * @param value to be cached
 * @returns {void}
 */
const setCache = <T>(key: Key, value: T): void => {
  if (hasValue(value)) {
    const data = JSON.stringify(value);
    window.localStorage.setItem(key as string, data);
  } else {
    window.localStorage.removeItem(key as string);
  }
};

/**
 * Using global state with SWR helpers
 * @param data state that to be shared or cached
 * @returns {Store<T>} state and setter
 * @see https://github.com/gadingnst/swr-global-state#create-a-store-object for example usage
 */
export function useStore<T>(data: StoreParams<T>): Store<T> {
  const { key, initial, persist } = data;

  const subscribed = useRef(true);
  const { cache } = useSWRConfig();
  const { data: state, mutate } = useSWR<T>(key, {
    fallbackData: initial ?? cache.get(key)
  });

  /**
   * State setter, use this to set the global state like `setState` from `useState` hooks.
   * Can use callback function to get previous state and use it to set the state.
   * @returns {StateMutator<T>} SWR Mutation
   * @see https://github.com/gadingnst/swr-global-state#using-store-on-your-component-1
   */
  const setState: StateMutator<T> = useCallback((data?: T|StateMutatorCallback<T>) => {
    const newState = typeof data === 'function'
      ? (data as StateMutatorCallback)(state)
      : data;
    if (isSupportPersistance(persist)) {
      setCache(key, newState);
    }
    mutate(newState);
  }, [key, state, persist]);

  useEffect(() => {
    if (subscribed.current && isSupportPersistance(persist)) {
      const persistState = getCache<T>(key);
      setState(persistState ?? initial);
    }
    return () => {
      subscribed.current = false;
    };
  }, []);

  return [state as T, setState] as const;
}

/**
 * Create custom hooks that wraps `useStore` to another function.
 * @param data state that to be shared or cached
 * @returns {StoreHooks<T>} state and setter
 * @see https://github.com/gadingnst/swr-global-state#best-practice for example best practice usage
 */
export function createStore<T>(data: StoreParams<T>): StoreHooks<T> {
  return () => useStore(data);
}

export default useStore;
