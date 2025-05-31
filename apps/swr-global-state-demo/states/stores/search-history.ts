import { createStore } from 'swr-global-state';
import localStoragePersistor from '../persistors/local-storage';

interface SearchHistory {
  queries: string[];
  lastSearch: string;
  searchCount: number;
}

const defaultSearchHistory: SearchHistory = {
  queries: [],
  lastSearch: '',
  searchCount: 0
};

/**
 * Search history store with throttle rate limiting
 * Prevents excessive API calls during rapid typing
 */
const useSearchHistory = createStore<SearchHistory>({
  key: '@app/search-history',
  initial: defaultSearchHistory,
  persistor: localStoragePersistor,
  rateLimit: {
    type: 'throttle',
    delay: 2000 // Throttle 2 detik untuk search history
  }
});

export default useSearchHistory;
