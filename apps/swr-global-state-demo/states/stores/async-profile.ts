import { createStore } from 'swr-global-state';
import asyncStoragePersistor from '../persistors/async-storage';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
  lastUpdated: string;
}

const defaultProfile: UserProfile = {
  id: '',
  name: 'Guest User',
  email: '',
  preferences: {
    theme: 'light',
    notifications: true
  },
  lastUpdated: new Date().toISOString()
};

/**
 * User profile store with async storage persistence and throttle rate limiting
 * Uses throttle to ensure profile saves don't exceed 1 per second
 */
const useAsyncProfile = createStore<UserProfile>({
  key: '@app/async-profile',
  initial: defaultProfile,
  persistor: asyncStoragePersistor,
  rateLimit: {
    type: 'throttle',
    delay: 1000 // Throttle 1 detik untuk profile updates
  }
});

export default useAsyncProfile;
