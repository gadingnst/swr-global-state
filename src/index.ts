import { useCallback, useEffect, useRef } from 'react';
import useSWR, { Key, KeyedMutator, useSWRConfig } from 'swr';

export interface Store<T> {
  key: Key;
  initial: T;
  persist?: boolean;
}

type MutatorCallback = <T>(state: T) => T;

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
export const hasValue = <T>(variable: T): boolean =>
  (typeof variable !== 'undefined' && variable !== null);

/**
 * get cached value from local storage
 * @param key store key
 * @returns {T} parsed persisted state
 */
export const getCache = <T = any>(key: Key): T => {
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
export const setCache = <T>(key: Key, value: T): void => {
  if (hasValue(value)) {
    const data = JSON.stringify(value);
    window.localStorage.setItem(key as string, data);
  } else {
    window.localStorage.removeItem(key as string);
  }
};

/**
 * using global state with SWR
 * @param data state that to be shared or cached
 * @returns {readonly [T, KeyedMutator<T>]} state and setter
 */
export function useStore<T>(data: Store<T>): readonly [T, KeyedMutator<T>] {
  const { key, initial, persist } = data;
  const { cache } = useSWRConfig();
  const { data: state, mutate } = useSWR<T>(key, {
    fallbackData: initial ?? cache.get(key)
  });

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
    const subscribed = useRef(true);
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
