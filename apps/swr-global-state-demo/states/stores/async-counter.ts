import { createStore } from 'swr-global-state';
import asyncStoragePersistor from '../persistors/async-storage';

/**
 * Counter store with async storage persistence and debounce rate limiting
 * Demonstrates async operations with loading states and optimized persistence
 */
const useAsyncCounter = createStore<number>({
  key: '@app/async-counter',
  initial: 0,
  persistor: asyncStoragePersistor,
  rateLimit: {
    type: 'debounce',
    delay: 2000
  }
});

export default useAsyncCounter;
