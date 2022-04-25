import { useEffect } from 'react';
import useSWR, { Key, KeyedMutator, useSWRConfig } from 'swr';

export interface Store<T> {
  key: Key;
  initial: T;
  persist?: boolean;
}

/**
 *
 * @param persist
 * @returns boolean if cache is supported
 */
const isSupportCache = (persist?: boolean): boolean => window.localStorage && !!persist;

/**
 *
 * @param key store key
 * @returns parsed persisted state
 */
const getCache = <T = any>(key: Key): T => {
  const cache = window.localStorage.getItem(key as string) ?? 'null';
  return JSON.parse(cache);
};

/**
 *
 * @param key store key
 * @param value to be cached
 * @returns void
 */
const setCache = <T>(key: Key, value: T) => {
  if (value) {
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
function useStore<T>(data: Store<T>) {
  const { key, initial, persist } = data;
  const { cache } = useSWRConfig();
  const { data: state, mutate } = useSWR<T>(key, {
    fallbackData: initial ?? cache.get(key)
  });

  const setState: KeyedMutator<T> = (...args) => {
    if (isSupportCache(persist)) {
      setCache(key, args[0]);
    }
    return mutate(...args);
  };

  useEffect(() => {
    if (isSupportCache(persist)) {
      const persistState = getCache<T>(key);
      setState(persistState || initial);
    }
  }, []);

  return [state as T, setState] as const;
}

export default useStore;
