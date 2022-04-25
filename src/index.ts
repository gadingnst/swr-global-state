import { useEffect } from 'react';
import useSWR, { Key, KeyedMutator, useSWRConfig } from 'swr';

export interface Store<T> {
  key: Key;
  initial: T;
  persist?: boolean;
}

type MutatorCallback = <T>(state: T) => T;

/**
 *
 * @param persist
 * @returns boolean if cache is supported
 */
const isSupportCache = (persist?: boolean): boolean =>
  window.localStorage && !!persist;

/**
 *
 * @param variable
 * @returns boolean if variable is has value
 */
export const hasValue = <T>(variable: T): boolean =>
  (typeof variable !== 'undefined' && variable !== null);

/**
 *
 * @param key store key
 * @returns parsed persisted state
 */
export const getCache = <T = any>(key: Key): T => {
  const cache = window.localStorage.getItem(key as string) ?? 'null';
  return JSON.parse(cache);
};

/**
 *
 * @param key store key
 * @param value to be cached
 * @returns void
 */
export const setCache = <T>(key: Key, value: T) => {
  if (hasValue(value)) {
    const data = JSON.stringify(value);
    window.localStorage.setItem(key as string, data);
  } else {
    window.localStorage.removeItem(key as string);
  }
};

/**
 *
 * @param data state that to be shared or cached
 * @returns state and setter
 */
export function useStore<T>(data: Store<T>) {
  const { key, initial, persist } = data;
  const { cache } = useSWRConfig();
  const { data: state, mutate } = useSWR<T>(key, {
    fallbackData: initial ?? cache.get(key)
  });

  const setState: KeyedMutator<T> = (...args) => {
    const [mutator, ...otherArgs] = args;
    const newState = typeof mutator === 'function'
      ? (mutator as MutatorCallback)(state as T)
      : mutator;
    if (isSupportCache(persist)) {
      setCache(key, newState);
    }
    return mutate(newState, ...otherArgs);
  };

  useEffect(() => {
    if (isSupportCache(persist)) {
      const persistState = getCache<T>(key);
      setState(persistState ?? initial);
    }
  }, []);

  return [state as T, setState] as const;
}

export default useStore;
