import { createStore } from 'swr-global-state';
import localStoragePersistor from '../persistors/local-storage';

/**
 * @see https://github.com/gadingnst/swr-global-state#custom-hooks
 */
const useCountPersist = createStore<number>({
  key: '@app/count-persisted', // (Required) state key
  initial: 0, // <- (Required) initial state
  persistor: localStoragePersistor
});

export default useCountPersist;
