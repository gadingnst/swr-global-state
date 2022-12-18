# ♻️ SWR Global State

[![npm](https://img.shields.io/npm/v/swr-global-state.svg)](https://www.npmjs.com/package/swr-global-state)
[![npm](https://img.shields.io/npm/dt/swr-global-state.svg)](https://npm-stat.com/charts.html?package=swr-global-state)
[![GitHub issues](https://img.shields.io/github/issues/gadingnst/swr-global-state.svg)](https://github.com/gadingnst/swr-global-state/issues)
[![Rate this package](https://badges.openbase.com/js/rating/swr-global-state.svg?token=zPIpBONkJ6OOQJcWjHNPStKx99B8TV6v9QKQ7ObwBlg=)](https://openbase.com/js/swr-global-state?utm_source=embedded&amp;utm_medium=badge&amp;utm_campaign=rate-badge)

Zero-setup & simple global state management for React Components based on [SWR](https://swr.vercel.app) helpers. With this library, you can focus on your awesome React Project and not waste another afternoon on the setup & configuring your global state. 🌄

# Table of Contents
- [♻️ SWR Global State](#️-swr-global-state)
- [Table of Contents](#table-of-contents)
- [Getting Started](#getting-started)
  - [Install](#install)
    - [NPM](#npm)
    - [Yarn](#yarn)
  - [Usage](#usage)
    - [Creating a Store](#creating-a-store)
    - [Using store on your component](#using-store-on-your-component)
    - [Persisted State](#persisted-state)
      - [Creating Persisted State](#creating-persisted-state)
      - [Reusable Persistor (Example in TypeScript)](#reusable-persistor-example-in-typescript)
      - [Asynchronous Persistor](#asynchronous-persistor)
      - [Best Practice with Persistor](#best-practice-with-persistor)
    - [Custom hooks](#custom-hooks)
- [Demo](#demo)
- [FAQ](#faq)
  - [Why should I use this?](#why-should-i-use-this)
  - [If this library can cover `Redux`, how about asynchronous state management like `redux-saga`, `redux-thunk`, or `redux-promise`?](#if-this-library-can-cover-redux-how-about-asynchronous-state-management-like-redux-saga-redux-thunk-or-redux-promise)
  - [React Native](#react-native)
- [Publishing](#publishing)
- [License](#license)
- [Feedbacks and Issues](#feedbacks-and-issues)
- [Support](#support)
  - [Global](#global)
  - [Indonesia](#indonesia)

# Getting Started
## Install
### NPM
```bash
npm i swr swr-global-state
```
### Yarn
```bash
yarn add swr swr-global-state
```

## Usage
### Creating a Store
Create a new file for your global state on your root directory. And then, use `createStore`. Example: `stores/counter.js`
```js
// file: stores/counter.js

import { createStore } from "swr-global-state";

const useCounter = createStore({
  key: "@app/counter", // (Required) state key
  initial: 0 // <- (Required) initial state
});

export default useCounter;
```

### Using store on your component
You just import stores that you have created into your any components, then use it like you use `useState` as usual.
```jsx
// file: components/SetCountComponent.js

import useCounter from "stores/counter";

function SetCountComponent() {
  const [, setCount] = useCounter(); // <- `[, ]` skipping first index of the array.
  return (
    <div>
      <button onClick={() => setCount(prev => prev - 1)}>
        (-) Decrease Count
      </button>
      &nbsp;
      <button onClick={() => setCount(prev => prev + 1)}>
        (+) Increase Count
      </button>
    </div>
  );
}

export default SetCountComponent;
```

```jsx
// file: components/GetCountComponent.js

import useCounter from "stores/counter";

function GetCountComponent() {
  const [count] = useCounter();
  return (
    <div>
      <p>Current Count: {count}</p>
    </div>
  );
}

export default GetCountComponent;
```

### Persisted State
#### Creating Persisted State
Optionally, you can define `persistor` object to create custom persistor to hold your state even user has closing app/browser, and re-opened it.
In this example, we use `localStorage` to hold our state.
```js
// file: stores/counter.js

import { createStore } from "swr-global-state";

const useCounter = createStore({
  key: "@app/counter",
  initial: 0,
  persistor: { // <- Optional, use this if you want hold the state
    onSet: (key, data) => {
      window.localStorage.setItem(String(key), data);
    },
    onGet: (key) => {
      const cachedData = window.localStorage.getItem(String(key));
      return Number(cachedData);
    }
  }
});

export default useCounter;
```

#### Reusable Persistor (Example in TypeScript)
We can create reusable `persistor` to re-use in every stores that we have created. Example:
```ts
// file: persistors/local-storage.ts

import type { StatePersistor, StateKey } from "swr-global-state";

const withLocalStoragePersistor = <T = any>(): StatePersistor<T> => ({
  onSet(key: StateKey, data: T) {
    const stringifyData = JSON.stringify(data);
    window.localStorage.setItem(String(key), stringifyData);
  },
  onGet(key: StateKey) {
    const cachedData = window.localStorage.getItem(String(key)) ?? "null";
    try {
      return JSON.parse(cachedData);
    } catch {
      return cachedData;
    }
  }
});

export default withLocalStoragePersistor;
```

Now, we can use that `withLocalStoragePersistor` in that like this:
```ts
// file: stores/counter.ts

import { createStore } from "swr-global-state";
import withLocalStoragePersistor from "persistors/local-storage";

const useCounter = createStore<number>({
  key: "@app/counter",
  initial: 0,
  persistor: withLocalStoragePersistor()
});

export default useCounter;
```

```ts
// file: stores/theme.ts

import { createStore } from "swr-global-state";
import withLocalStoragePersistor from "persistors/local-storage";

const useTheme = createStore<string>({
  key: "@app/theme",
  initial: "light",
  persistor: withLocalStoragePersistor()
});

export default useTheme;
```

#### Asynchronous Persistor
Just use ***async function or promise*** as usual in `onSet` and `onGet`.
```js
// file: stores/counter.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStore } from "swr-global-state";

const useCounter = createStore({
  key: "@app/counter",
  initial: 0,
  persistor: {
    async onSet(key, data) {
      try {
        await AsyncStorage.setItem(String(key), data);
      } catch (err) {
        // handle saving error, default throw an error
        throw new Error(err);
      }
    },
    async onGet(key) {
      try {
        const value = await AsyncStorage.getItem(String(key));
        return Number(value);
      } catch (err) {
        // handle error reading value
        throw new Error(err);
      }
    }
  }
});

export default useCounter;
```

#### Best Practice with Persistor
Best practice in using `persistor` is use [Debouncing Technique](https://www.google.com/search?q=debounce+technique+programming). This example is using `debouncing` in `onSet` callback. So, it will not spamming to call the callback request every state changes.
```js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStore } from "swr-global-state";

const withDebounce = (fn, time) => {
  let timeoutId;
  const wrapper = (...args) => {
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

const useUser = createStore({
  key: "@app/user",
  initial: null,
  persistor: {
    onSet: withDebounce(async(key, user) => {
      try {
        const stringifyUser = JSON.stringify(user)
        await AsyncStorage.setItem(String(key), stringifyUser);
      } catch (err) {
        // handle saving error, default throw an error
        throw new Error(err);
      }
    }, 1000), // debounce-effect in 1 second.
    ...
  }
});

export default useUser;
```

### Custom hooks
Can't find your cases in this documentation examples? You can create custom hooks by yourself.
Here is complex example you can refer the pattern to create another custom hooks cases.
```js
// file: stores/account.js
...
import useStore from "swr-global-state";

const KEY = "@app/account";

function useAccount() {
  const [account, setAccount, swrDefaultResponse] = useStore(
    {
      key: KEY,
      initial: null,
      persistor: {
        onSet: (key, accountData) => {
          window.localStorage.setItem(String(key), JSON.stringify(accountData));
        },
        onGet: async(key) => {
          if (window.navigator.onLine) {
            const remoteAccount = await fetch('/api/account');
            return remoteAccount.json();
          }
          const cachedAccount = window.localStorage.getItem(String(key));
          return JSON.parse(cachedAccount);
        }
      }
    },
    {
      /**
       * set another SWR config here
       * @see https://swr.vercel.app/docs/options#options
       * @default on `swr-global-state`:
       * revalidateOnFocus: false
       * revalidateOnReconnect: false
       * refreshWhenHidden: false
       * refreshWhenOffline: false
       */
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  );

  /**
   * Destructuring response from SWR Default response
   * @see https://swr.vercel.app/docs/options#return-values
   */
  const { mutate, error } = swrDefaultResponse;

  /**
   * create custom loading state
   * @see https://swr.vercel.app/docs/getting-started#make-it-reusable
   */
  const loading = !account && !error;

  const destroyAccount = async () => {
    await fetch('/api/account/logout');
    window.localStorage.removeItem(KEY);
    // use default `mutate` from SWR to avoid `onSet` callback in `persistor`
    mutate(null);
  };

  const updateAccount = async (newAccountData) => {
    await fetch('/api/account', {
      method: 'POST',
      body: JSON.stringify(newAccountData)
      ...
    })
    setAccount(newAccountData);
  };

  // your very custom mutator/dispatcher

  return {
    loading,
    error,
    account,
    updateAccount,
    destroyAccount
  };
}

export default useAccount;
```
Then, use that custom hooks in your component as usual.
```jsx
// file: App.js
...
import useAccount from "stores/account";

function App() {
  const {
    account,
    updateAccount,
    destroyAccount,
    loading,
    error
  } = useAccount();

  const onLogout = async () => {
    await destroyAccount()
    // your very logic
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>An Error occured</div>;
  }

  return (
    <div>
      <p>Account Detail: {JSON.stringify(account)}</p>
      <button onClick={onLogout}>Logout</button>
      {/* your very component to update account */}
    </div>
  );
}

export default App;
```

# Demo
You can see live demo [here](https://swr-global-state-demo.gading.dev/)

# FAQ
## Why should I use this?
- If you want to manage your global state like `useState` as usual.
- If you want to manage your global state without involving in setting up Provider Component, Dispatcher, Reducer, etc.
- If you want to see `Redux` or `Context API` alternative.
- If you're already use `SWR`, but you have no idea how to manage synchronous global state with `SWR` on client-side.
- If you're still use `Redux` or `Context API`, but you are overwhelmed with their flow.

## If this library can cover `Redux`, how about asynchronous state management like `redux-saga`, `redux-thunk`, or `redux-promise`?
[SWR](https://swr.vercel.app) can cover this. [see](https://github.com/vercel/swr/discussions/587).

At this point, `swr-global-state` is based and depends on [SWR](https://www.npmjs.com/package/swr). After version `>2` or later, `swr-global-state` now can handle *async state* too. Just wraps your *very async state logic* into a function like in [Custom Hooks](#custom-hooks) or [Asynchronous Persistor](#asynchronous-persistor).

So, you basically don't need to use `Redux` or `Context API` anymore. Alternatively, you can choose [TanStack Query](https://tanstack.com/query) or default [SWR](https://swr.vercel.app) itself.

## React Native
Since [SWR itself supports React Native](https://swr.vercel.app/docs/advanced/react-native), of course `swr-global-state` supports it too. [This example](#asynchronous-persistor) is using `Async Storage` in React Native.

***Things to note***, you must install `swr-global-state` version `>2` or later, because it has customizable `persistor`. So, you can customize the `persistor` with `React Native Async Storage`.

Under version `<2`, `swr-global-state` still use `localStorage` and we can't customize it. So, it doesn't support React Native.

# Publishing
- Before pushing your changes to Github, make sure that `version` in `package.json` is changed to newest version. Then run `npm install` for synchronize it to `package-lock.json`
- After your changes have been merged on branch `main`, you can publish the packages by creating new Relase here: https://github.com/gadingnst/swr-global-state/releases/new
- Create new `tag`, make sure the `tag` name is same as the `version` in `package.json`.
- You can write Release title and notes here. Or you can use auto-generated release title and notes.
- Click `Publish Release` button, then wait the package to be published.

# License
`swr-global-state` is freely distributable under the terms of the [MIT license](https://github.com/gadingnst/swr-global-state/blob/master/LICENSE).

# Feedbacks and Issues
Feel free to open issues if you found any feedback or issues on `swr-global-state`. And feel free if you want to contribute too! 😄

# Support
## Global
[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/gadingnst)
## Indonesia
- [Trakteer](https://trakteer.id/gadingnst)
- [Karyakarsa](https://karyakarsa.com/gadingnst)

---

Built with ❤️ by [Sutan Gading Fadhillah Nasution](https://github.com/gadingnst) on 2022
