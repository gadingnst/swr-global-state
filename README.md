# ♻️ Store SWR
Zero-setup & simple state management for React Components with SWR. So you can focus on your awesome React Project and not waste another afternoon on the setup & configuring your global state. 🌄

# Table of Contents
- [♻️ Store SWR](#️-store-swr)
- [Table of Contents](#table-of-contents)
- [Getting Started](#getting-started)
  - [Install](#install)
  - [Usage](#usage)
    - [Create a store](#create-a-store)
    - [Using store on your component](#using-store-on-your-component)
    - [TypeScript](#typescript)
- [Publishing](#publishing)

# Getting Started
## Install
- Create a new file named `.npmrc` in your project root directory.
- Add the following content to that file:
```
@gadingnst:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGE_TOKEN}
```

- You can generate `GITHUB_PACKAGE_TOKEN` in your profile settings here: https://github.com/settings/tokens
- Choose the token expiration according to what you want.
- In creating Github Token, check only `read:packages` permissions, Click `Generate Token` button.
- Then copy the token and replace it in the `{GITHUB_PACKAGE_TOKEN}`. Or you can just define it on your Environment Variables, see: https://stackoverflow.com/a/55578270/8112320
- After that, run following command.
```
npm install swr @gadingnst/store-swr

//or
yarn add swr @gadingnst/store-swr
```

## Usage
### Create a store
Create a new file for your global state on your root directory. Example: `stores/app.js`
```js
// stores/app.js

export const APP_COUNT = {
  key: '@app/count', // (Required) state key
  initial: 0, // <- (Required) initial state
  persist: false // <- (Optional) if you want to persist the state to local storage, then set it to true.
};
```
### Using store on your component
```js
// components/SetCountComponent.js

import { useStore } from '@gadingnst/store-swr';
import { APP_COUNT } from 'stores/app';

function SetCountComponent() {
  const [count, setCount] = useStore(APP_COUNT);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Increase Count</button>
      <button onClick={() => setCount(count - 1)}>Decrease Count</button>
    </div>
  );
}

export default SetCountComponent;
```

```js
// components/GetCountComponent.js

import { useStore } from '@gadingnst/store-swr';
import { APP_COUNT } from 'stores/app';

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
// stores/app.ts
import type { Store } from '@gadingnst/store-swr';

export const APP_COUNT: Store<number> = {
  key: '@app/count',
  initial: 0,
  persist: false
};

// interface Store is generic type. It must be passed type parameter
```


# Publishing
- Before pushing your changes to Github, make sure that `version` in `package.json` is changed to newest version. Then run `npm install` for synchronize it to `package-lock.json`
- After your changes have been merged on branch `main`, you can publish the packages by creating new Relase here: https://github.com/gadingnst/store-swr/releases/new
- Create new `tag`, make sure the `tag` name is same as the `version` in `package.json`.
- You can write Release title and notes here. Or you can use auto-generated release title and notes.
- Click `Publish Release` button, then wait the package to be published.
