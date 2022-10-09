# ♻️ SWR Global State
Zero-setup & simple state management for React Components with SWR. So you can focus on your awesome React Project and not waste another afternoon on the setup & configuring your global state. 🌄

# Table of Contents
- [♻️ SWR Global State](#️-swr-global-state)
- [Table of Contents](#table-of-contents)
- [Getting Started](#getting-started)
  - [Install](#install)
  - [Usage](#usage)
    - [Create a store object](#create-a-store-object)
    - [Using store on your component](#using-store-on-your-component)
    - [TypeScript](#typescript)
  - [Best Practice](#best-practice)
    - [Custom hooks](#custom-hooks)
    - [Using store on your component](#using-store-on-your-component-1)
    - [Example custom hooks with TypeScript](#example-custom-hooks-with-typescript)
- [Demo](#demo)
- [Publishing](#publishing)
- [License](#license)

# Getting Started
## Install
```
npm install swr-global-state

//or
yarn add swr-global-state
```

## Usage
### Create a store object
Create a new file for your global state on your root directory. Example: `stores/app.js`
```js
// file: stores/app.js

export const APP_COUNT = {
  key: "@app/count", // (Required) state key
  initial: 0, // <- (Required) initial state
  persist: false // <- (Optional) if you want to persist the state to local storage, then set it to true.
};
```
### Using store on your component
```jsx
// file: components/SetCountComponent.js

import { useStore } from "swr-global-state";
import { APP_COUNT } from "stores/app";

function SetCountComponent() {
  const [count, setCount] = useStore(APP_COUNT);
  return (
    <div>
      <button onClick={() => setCount(count - 1)}>
        (-) Decrease Count
      </button>
      &nbsp;
      <button onClick={() => setCount(count + 1)}>
        (+) Increase Count
      </button>
    </div>
  );
}

export default SetCountComponent;
```

```jsx
// file: components/GetCountComponent.js

import { useStore } from "swr-global-state";
import { APP_COUNT } from "stores/app";

function GetCountComponent() {
  const [count] = useStore(APP_COUNT);
  return (
    <div>
      <p>Current Count: {count}</p>
    </div>
  );
}

export default GetCountComponent;
```

### TypeScript
```ts
// file: stores/app.ts
import type { StoreParams } from "swr-global-state";

export const APP_COUNT: StoreParams<number> = {
  key: "@app/count",
  initial: 0,
  persist: false
};

// interface Store is generic type. It must be passed type parameter
```

## Best Practice
### Custom hooks
Instead of creating store object in `stores/app.js` file, you can wrap it into custom hooks. Example: `stores/count.js`.
```js
// file: stores/count.js

import useStore from "swr-global-state";

const useCount = () => useStore({
  key: "@app/count", // (Required) state key
  initial: 0, // <- (Required) initial state
  persist: true // <- (Optional) if you want to persist the state to local storage, then set it to true.
});

export default useCount;
```

### Using store on your component
```jsx
// file: components/SetCountComponent.js

import useCount from "stores/count";

function SetCountComponent() {
  const [, setCount] = useCount(); // <- `[, ]` skipping first index of the array.
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

import useCount from "stores/count";

function GetCountComponent() {
  const [count] = useCount();
  return (
    <div>
      <p>Current Count: {count}</p>
    </div>
  );
}

export default GetCountComponent;
```

### Example custom hooks with TypeScript
```ts
// file: stores/count.ts

import useStore, { Store } from "swr-global-state";

const useCount = (): Store<number> => useStore<number>({
  key: "@app/count",
  initial: 0
});

export default useCount;
```

# Demo
- You can see demo repository [here](https://github.com/gadingnst/swr-global-state-demo)
- You can see live demo [here](https://swr-global-state-demo.gading.dev/)

# Publishing
- Before pushing your changes to Github, make sure that `version` in `package.json` is changed to newest version. Then run `npm install` for synchronize it to `package-lock.json`
- After your changes have been merged on branch `main`, you can publish the packages by creating new Relase here: https://github.com/gadingnst/swr-global-state/releases/new
- Create new `tag`, make sure the `tag` name is same as the `version` in `package.json`.
- You can write Release title and notes here. Or you can use auto-generated release title and notes.
- Click `Publish Release` button, then wait the package to be published.

# License
`swr-global-state` is freely distributable under the terms of the [MIT license](https://github.com/gadingnst/swr-global-state/blob/master/LICENSE).

---

Built with ❤️ by [Sutan Gading Fadhillah Nasution](https://github.com/gadingnst) on 2022
