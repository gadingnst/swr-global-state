import { SWRConfiguration } from 'swr';
import { StoreParams, useStore } from './useStore';

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

export * from './useStore';

const sgs = {
  createStore,
  useStore
};

export default sgs;
