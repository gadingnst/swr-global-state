import { createStore } from 'swr-global-state';

/**
 * @see https://github.com/gadingnst/swr-global-state#custom-hooks
 */
const useCount = createStore({
  key: '@app/count', // (Required) state key
  initial: 0 // <- (Required) initial state
});

export default useCount;
