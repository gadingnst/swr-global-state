import { createStore } from 'swr-global-state';
import localStoragePersistor from '../persistors/local-storage';

/**
 * Custom rate limiting function that combines debounce and throttle
 * Provides immediate feedback but limits actual persistence calls
 */
const customCounterRateLimit = <T>(func: (key: any, data: T) => Promise<void>, delay: number) => {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout;

  return (key: any, data: T) => {
    const now = Date.now();

    // Throttle: jika terlalu cepat, skip
    if (now - lastCall < delay / 3) {
      return;
    }

    // Debounce: delay execution untuk batch updates
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      lastCall = Date.now();
      func(key, data);
    }, delay / 2);
  };
};

/**
 * Counter store with custom rate limiting for optimal UX
 * @see https://github.com/gadingnst/swr-global-state#custom-hooks
 */
const useCountPersist = createStore<number>({
  key: '@app/count-persisted',
  initial: 0,
  persistor: localStoragePersistor,
  rateLimit: {
    type: 'debounce', // Required for TypeScript
    delay: 600,
    customFunction: customCounterRateLimit
  }
});

export default useCountPersist;
