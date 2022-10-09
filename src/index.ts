import { useCallback, useEffect, useRef } from 'react';
import useSWR, { Key, KeyedMutator, useSWRConfig } from 'swr';

export type MutatorCallback = <T>(state: T) => T;

/**
 * Type for returns from `useStore` hooks.
 * @see https://github.com/gadingnst/swr-global-state#example-custom-hooks-with-typescript for-example case
 */
export type Store<T>= readonly [T, KeyedMutator<T>];

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
 * check is variable has value
 * @param variable
 * @returns {boolean} boolean if variable is has value
 */
const hasValue = <T>(variable: T): boolean =>
  (typeof variable !== 'undefined' && variable !== null);

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
 * @see https://github.com/gadingnst/swr-global-state#best-practice for example best practice usage
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
   * @returns {KeyedMutator<T>}
   * @see https://github.com/gadingnst/swr-global-state#using-store-on-your-component-1
   */
  const setState: KeyedMutator<T> = useCallback((...args) => {
    const [mutator, ...otherArgs] = args;
    const newState = typeof mutator === 'function'
      ? (mutator as MutatorCallback)(state as T)
      : mutator;
    if (isSupportPersistance(persist)) {
      setCache(key, newState);
    }
    return mutate(newState, ...otherArgs);
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

export default useStore;
