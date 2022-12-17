import { createStore, StateKey } from 'swr-global-state';
import localStoragePersistor from '../persistors/local-storage';

const sleep = (delay = 3000) => new Promise((resolve) => {
  setTimeout(resolve, delay);
});

const debounce = (fn: any, time: any) => {
  let timeoutId: any;
  const wrapper = (...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn(...args);
    }, time);
  };
  return wrapper;
};

/**
 * @see https://github.com/gadingnst/swr-global-state#custom-hooks
 */
const useCountAsync = createStore<number>({
  key: '@app/count-async',
  initial: 0,
  persistor: {
    onSet: debounce(async(key: StateKey, data: number) => {
      await sleep(500);
      localStoragePersistor.onSet(key, data);
    }, 500),
    onGet: async(key) => {
      await sleep(1000);
      return localStoragePersistor.onGet(key);
    }
  }
}, {
  revalidateOnMount: true
});

export default useCountAsync;
