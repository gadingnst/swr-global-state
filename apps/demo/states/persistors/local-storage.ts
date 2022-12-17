import type { StatePersistor, StateKey } from 'swr-global-state';

const localStoragePersistor: StatePersistor<any> = {
  onSet(key: StateKey, data) {
    const stringifyData = JSON.stringify(data);
    window.localStorage.setItem(String(key), stringifyData);
  },
  onGet(key: StateKey) {
    const cachedData = window.localStorage.getItem(String(key)) ?? 'null';
    try {
      return JSON.parse(cachedData);
    } catch {
      return cachedData;
    }
  }
};

export default localStoragePersistor;
