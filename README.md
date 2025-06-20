# ♻️ SWR Global State

[![npm](https://img.shields.io/npm/v/swr-global-state.svg)](https://www.npmjs.com/package/swr-global-state)
[![npm](https://img.shields.io/npm/dt/swr-global-state.svg)](https://npm-stat.com/charts.html?package=swr-global-state)
[![GitHub issues](https://img.shields.io/github/issues/gadingnst/swr-global-state.svg)](https://github.com/gadingnst/swr-global-state/issues)

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
    - [Rate Limiting](#rate-limiting)
      - [Debounce Rate Limiting](#debounce-rate-limiting)
      - [Throttle Rate Limiting](#throttle-rate-limiting)
      - [Custom Rate Limiting](#custom-rate-limiting)
    - [Async State Management](#async-state-management)
      - [Async Counter with Loading States](#async-counter-with-loading-states)
      - [Async Profile Management](#async-profile-management)
    - [Custom hooks](#custom-hooks)
- [Demo](#demo)
- [AI/LLM Usage](#aillm-usage)
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
  key: "@app/counter", // (Required) state key with unique string
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

### Rate Limiting
Rate limiting helps optimize performance by controlling how frequently state updates are persisted. This is especially useful for rapid user interactions or frequent state changes.

#### Debounce Rate Limiting
Debounce delays the execution until after a specified time has passed since the last call. Perfect for scenarios like search inputs or rapid counter increments.

```ts
// file: stores/async-counter.ts

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
    delay: 2000 // Wait 2 seconds after last change before persisting
  }
});

export default useAsyncCounter;
```

#### Throttle Rate Limiting
Throttle ensures that the function is called at most once per specified interval. Ideal for preventing excessive API calls during rapid typing.

```ts
// file: stores/search-history.ts

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
    delay: 1000 // Allow persistence at most once per second
  }
});

export default useSearchHistory;
```

#### Custom Rate Limiting
For advanced use cases, you can implement custom rate limiting logic that combines multiple strategies.

```ts
// file: stores/count-persisted.ts

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

    // Throttle: if too fast, skip
    if (now - lastCall < delay / 3) {
      return;
    }

    // Debounce: delay execution for batch updates
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      lastCall = Date.now();
      func(key, data);
    }, delay);
  };
};

const usePersistedCounter = createStore<number>({
  key: '@app/persisted-counter',
  initial: 0,
  persistor: {
    onSet: customCounterRateLimit(localStoragePersistor.onSet, 1500),
    onGet: localStoragePersistor.onGet
  }
});

export default usePersistedCounter;
```

### Async State Management
#### Async Counter with Loading States
Demonstrates how to handle async operations with loading states and error handling.

```tsx
// file: components/AsyncCounter.tsx

import { useState } from 'react';
import useAsyncCounter from '../stores/async-counter';

export default function AsyncCounter() {
  const [counter, setCounter, { isLoading, error, isPersisting }] = useAsyncCounter();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleIncrement = async() => {
    setIsUpdating(true);
    await setCounter(prev => prev + 1);
    setIsUpdating(false);
  };

  const handleDecrement = async() => {
    setIsUpdating(true);
    await setCounter(prev => prev - 1);
    setIsUpdating(false);
  };

  const handleReset = async() => {
    setIsUpdating(true);
    await setCounter(50);
    setIsUpdating(false);
  };

  if (isLoading) {
    return <div>Loading counter...</div>;
  }

  if (error) {
    return <div>Error loading counter: {error.message}</div>;
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>Async Counter with Debounce (2s)</h3>
      <div style={{ fontSize: '24px', margin: '10px 0' }}>
        Count: {counter}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <button
          onClick={handleDecrement}
          disabled={isUpdating || isPersisting}
        >
          {isUpdating ? 'Updating...' : 'Decrement'}
        </button>
        <button
          onClick={handleIncrement}
          disabled={isUpdating || isPersisting}
        >
          {isUpdating ? 'Updating...' : 'Increment'}
        </button>
        <button
          onClick={handleReset}
          disabled={isUpdating || isPersisting}
        >
          {isUpdating ? 'Updating...' : 'Reset to 50'}
        </button>
      </div>

      {isPersisting && (
        <div style={{ color: 'orange', fontSize: '12px' }}>
          💾 Saving to storage...
        </div>
      )}

      <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        💡 Changes are debounced and saved 2 seconds after the last update
      </div>
    </div>
  );
}
```

#### Async Profile Management
Shows complex state management with nested objects and multiple async operations.

```tsx
// file: components/AsyncProfile.tsx

import { useState, useEffect } from 'react';
import useAsyncProfile from '../stores/async-profile';

function AsyncProfile() {
  const [profile, setProfile, { isLoading, error }] = useAsyncProfile();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email
  });

  // Sync formData with profile when profile changes
  useEffect(() => {
    setFormData({
      name: profile.name,
      email: profile.email
    });
  }, [profile.name, profile.email]);

  const handleUpdateProfile = async() => {
    setIsUpdating(true);
    try {
      await setProfile(prev => ({
        ...prev,
        name: formData.name,
        email: formData.email,
        lastUpdated: new Date().toISOString()
      }));
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleTheme = async() => {
    setIsUpdating(true);
    try {
      await setProfile(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          theme: prev.preferences.theme === 'light' ? 'dark' : 'light'
        },
        lastUpdated: new Date().toISOString()
      }));
    } catch (err) {
      console.error('Failed to toggle theme:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return <div>Error loading profile: {error.message}</div>;
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>Async Profile Management</h3>

      <div style={{ marginBottom: '15px' }}>
        <label>
          Name:
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>
          Email:
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </label>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button
          onClick={handleUpdateProfile}
          disabled={isUpdating}
        >
          {isUpdating ? 'Updating...' : 'Update Profile'}
        </button>
        <button
          onClick={handleToggleTheme}
          disabled={isUpdating}
        >
          {isUpdating ? 'Updating...' : `Switch to ${profile.preferences.theme === 'light' ? 'Dark' : 'Light'}`}
        </button>
      </div>

      <div style={{ fontSize: '12px', color: '#666' }}>
        <div>Current Theme: {profile.preferences.theme}</div>
        <div>Last Updated: {new Date(profile.lastUpdated).toLocaleString()}</div>
      </div>
    </div>
  );
}

export default AsyncProfile;
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
  const [loading, setLoading] = useStore({
    key: `${KEY}-loading`,
    initial: true
  });
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
          setLoading(false);
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

  const destroyAccount = async () => {
    setLoading(true);
    await fetch('/api/account/logout');
    window.localStorage.removeItem(KEY);
    // use default `mutate` from SWR to avoid `onSet` callback in `persistor`
    mutate(null);
    setLoading(false);
  };

  const updateAccount = async (newAccountData) => {
    setLoading(true);
    await fetch('/api/account', {
      method: 'POST',
      body: JSON.stringify(newAccountData)
      ...
    })
    setAccount(newAccountData);
    setLoading(false);
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

**Featured Demos:**
- **Basic Counter**: Simple state management without persistence
- **Persisted Counter**: State that survives page refreshes using localStorage
- **Async Counter**: Demonstrates async operations with loading states and debounce rate limiting
- **Async Profile**: Complex nested state management with multiple async operations
- **Rate Limit Demo**: Search functionality with throttle rate limiting to prevent excessive calls
- **Custom Rate Limiting**: Advanced rate limiting combining debounce and throttle strategies

# AI/LLM Usage

For AI assistants and Large Language Models (LLMs) working with this library, we provide comprehensive usage rules and patterns to help understand and implement `swr-global-state` effectively.

## AI Usage Rules

A detailed guide for AI assistants is available that covers:
- Core concepts and API reference
- Usage patterns and best practices
- Persistence strategies (localStorage, AsyncStorage)
- Rate limiting techniques (debounce, throttle, custom)
- Error handling and async state management
- Common implementation patterns

**📖 View the complete AI usage rules:** [llm-rules.md](https://raw.githubusercontent.com/gadingnst/swr-global-state/refs/heads/main/llm-rules.md)

This guide is specifically designed to help AI assistants:
- Understand the library's architecture and patterns
- Generate appropriate code examples
- Implement best practices for different use cases
- Handle edge cases and error scenarios
- Optimize performance with rate limiting

# FAQ
## Why should I use this?
- If you want to manage your global state like `useState` as usual.
- If you want to manage your global state without involving in setting up Provider Component, Dispatcher, Reducer, etc.
- If you want to see `Redux` or `Context API` alternative.
- If you're already use `SWR`, but you have no idea how to manage synchronous global state with `SWR` on client-side.
- If you're still use `Redux` or `Context API`, but you are overwhelmed with their flow.
- If you need built-in rate limiting for performance optimization.
- If you want async state management with loading states out of the box.

## If this library can cover `Redux`, how about asynchronous state management like `redux-saga`, `redux-thunk`, or `redux-promise`?
[SWR](https://swr.vercel.app) can cover this. [see](https://github.com/vercel/swr/discussions/587).

At this point, `swr-global-state` is based and depends on [SWR](https://www.npmjs.com/package/swr). After version `>2` or later, `swr-global-state` now can handle *async state* too. Just wraps your *very async state logic* into a function like in [Custom Hooks](#custom-hooks) or [Asynchronous Persistor](#asynchronous-persistor).

Additionally, `swr-global-state` provides built-in rate limiting strategies (debounce, throttle, custom) that help optimize performance for frequent state updates, which is especially useful for async operations.

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
