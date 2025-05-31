import type { StatePersistor, StateKey } from 'swr-global-state';

/**
 * Dummy async storage that simulates real async storage behavior
 * with sleep delays to demonstrate async operations and rate limiting
 */
const asyncStoragePersistor: StatePersistor<any> = {
  /**
   * Simulate async set operation with delay
   */
  async onSet(key: StateKey, data: any) {
    // Simulate network/storage delay
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const stringifyData = JSON.stringify(data);
      window.localStorage.setItem(`async_${String(key)}`, stringifyData);
      console.log(`✅ [Rate Limited] Async saved: ${String(key)}`, data);
    } catch (error) {
      console.error('❌ Failed to save to async storage:', error);
      throw error;
    }
  },

  /**
   * Simulate async get operation with delay
   */
  async onGet(key: StateKey) {
    // Simulate network/storage delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const cachedData = window.localStorage.getItem(`async_${String(key)}`) ?? 'null';
      const parsedData = JSON.parse(cachedData);
      console.log(`📖 Async loaded: ${String(key)}`, parsedData);
      return parsedData;
    } catch (error) {
      console.error('❌ Failed to load from async storage:', error);
      return null;
    }
  }
};

export default asyncStoragePersistor;
