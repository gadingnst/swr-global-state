/* eslint-disable no-throw-literal */
import { useStore } from 'swr-global-state';
import localStoragePersistor from '../persistors/local-storage';

const sleep = (delay = 500) => new Promise((resolve) => {
  setTimeout(resolve, delay);
});

const KEY = '@app/data';
const DUMMY_TOKEN_KEY = '@app/token';

function useData() {
  const [isLoading, setLoading] = useStore({
    key: `${KEY}-loading`,
    initial: true
  });
  const [data, , swrDefaultResponse] = useStore(
    {
      key: KEY,
      initial: null,
      persistor: {
        onSet: localStoragePersistor.onSet,
        onGet: async(key) => {
          try {
            const token = window.localStorage.getItem(DUMMY_TOKEN_KEY);
            if (token) {
              const remoteDataFetch = await fetch('https://api.quran.gading.dev/');
              const remoteData = await remoteDataFetch.json();
              localStoragePersistor.onSet(key, remoteData);
              return remoteData;
            }
            throw { status: 401 };
          } catch (err: any) {
            if (window.navigator.onLine) {
              if (err?.status !== 401) {
                window.alert('An error occured, returned cached data');
              } else {
                throw err;
              }
            }
            const cachedData = localStoragePersistor.onGet(key);
            return cachedData;
          } finally {
            setLoading(false);
          }
        }
      }
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  );

  const { mutate, error } = swrDefaultResponse;

  const login = async() => {
    setLoading(true);
    window.localStorage.setItem(DUMMY_TOKEN_KEY, 'token_login');
    await sleep(750);
    mutate();
    setLoading(false);
  };

  const logout = async() => {
    setLoading(true);
    window.localStorage.removeItem(KEY);
    window.localStorage.removeItem(DUMMY_TOKEN_KEY);
    // simulate async request
    await sleep();
    // fetching logout
    mutate(null);
    setLoading(false);
  };

  // your very custom mutator/dispatcher

  return {
    data,
    error,
    login,
    logout,
    isLoading
  };
}

export default useData;
