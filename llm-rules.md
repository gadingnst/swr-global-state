# AI Usage Rules for swr-global-state

## Overview
`swr-global-state` is a zero-setup global state management library for React built on top of SWR. It provides simple, useState-like API for managing global state with optional persistence and rate limiting.

## Core Concepts

### 1. Basic Store Creation
```typescript
import { createStore } from 'swr-global-state';

const useCounter = createStore({
  key: '@app/counter',    // Required: unique string identifier
  initial: 0             // Required: initial state value
});
```

### 2. Store Usage Pattern
```typescript
function Component() {
  const [state, setState, swrResponse] = useCounter();
  // Use like useState but globally shared
}
```

## API Reference

### createStore Parameters
- **key** (required): `StateKey` - Unique identifier for the store
- **initial** (required): `T` - Initial state value
- **persistor** (optional): `StatePersistor<T>` - Custom persistence logic
- **onError** (optional): `(error: Error) => void` - Error handler
- **retryOnError** (optional): `boolean` - Whether to retry on errors (default: true)
- **rateLimit** (optional): `RateLimitConfig<T>` - Rate limiting configuration

### Return Value
Returns a tuple: `[state, setState, swrResponse & { isLoading, error, isPersisting }]`

## Persistence Patterns

### Basic localStorage Persistor
```typescript
const usePersistedCounter = createStore({
  key: '@app/counter',
  initial: 0,
  persistor: {
    onSet: (key, data) => localStorage.setItem(String(key), JSON.stringify(data)),
    onGet: (key) => JSON.parse(localStorage.getItem(String(key)) || 'null')
  }
});
```

### Async Persistor (React Native)
```typescript
const useAsyncStore = createStore({
  key: '@app/data',
  initial: null,
  persistor: {
    onSet: async (key, data) => {
      await AsyncStorage.setItem(String(key), JSON.stringify(data));
    },
    onGet: async (key) => {
      const value = await AsyncStorage.getItem(String(key));
      return value ? JSON.parse(value) : null;
    }
  }
});
```

## Rate Limiting

### Debounce (delays execution until after specified time)
```typescript
const useSearchStore = createStore({
  key: '@app/search',
  initial: '',
  persistor: myPersistor,
  rateLimit: {
    type: 'debounce',
    delay: 1000  // Wait 1s after last change
  }
});
```

### Throttle (limits execution frequency)
```typescript
const useThrottledStore = createStore({
  key: '@app/throttled',
  initial: 0,
  persistor: myPersistor,
  rateLimit: {
    type: 'throttle',
    delay: 500  // At most once per 500ms
  }
});
```

### Custom Rate Limiting
```typescript
const useCustomStore = createStore({
  key: '@app/custom',
  initial: 0,
  rateLimit: {
    type: 'debounce',
    delay: 1000,
    customFunction: (func, delay) => {
      // Custom rate limiting logic
      return (key, data) => {
        // Your implementation
      };
    }
  }
});
```

## Error Handling

```typescript
const useStoreWithErrorHandling = createStore({
  key: '@app/data',
  initial: null,
  onError: (error) => {
    console.error('Store error:', error);
    // Handle error (e.g., show toast, log to service)
  },
  retryOnError: false  // Don't retry on persistence errors
});
```

## Advanced Usage Patterns

### Custom Hook Pattern
```typescript
function useAccount() {
  const [account, setAccount, { isLoading, error }] = useStore({
    key: '@app/account',
    initial: null,
    persistor: {
      onGet: async (key) => {
        const response = await fetch('/api/account');
        return response.json();
      },
      onSet: async (key, data) => {
        await fetch('/api/account', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      }
    }
  });

  const updateAccount = async (newData) => {
    await setAccount(newData);
  };

  return { account, updateAccount, isLoading, error };
}
```

### State Updates
```typescript
// Direct value
setState(newValue);

// Function updater
setState(prev => prev + 1);

// Async updater
setState(async (prev) => {
  const result = await someAsyncOperation(prev);
  return result;
});
```

## Best Practices for AI

1. **Always provide unique keys**: Use descriptive, namespaced keys like `@app/feature/data`

2. **Handle loading states**: Use the `isLoading` flag from the third return value

3. **Implement error boundaries**: Always handle the `error` state appropriately

4. **Use rate limiting for performance**: Apply debounce for user input, throttle for frequent updates

5. **Persist strategically**: Only persist data that needs to survive app restarts

6. **Type safety**: Always specify TypeScript types for better development experience

```typescript
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

const useUserProfile = createStore<UserProfile>({
  key: '@app/user/profile',
  initial: { id: '', name: '', email: '' }
});
```

7. **SWR Configuration**: Pass SWR options as second parameter to `createStore` or `useStore`

```typescript
const useStore = createStore(storeConfig, {
  revalidateOnFocus: true,
  revalidateOnReconnect: true
});
```

## Common Patterns

- **Counter**: Simple numeric state with increment/decrement
- **Form State**: Complex object state with validation
- **User Session**: Authentication state with persistence
- **Theme**: UI preferences with localStorage persistence
- **Shopping Cart**: Array state with localStorage persistence
- **Search**: String state with debounced API calls

## Integration Notes

- Works with any React application (Next.js, CRA, Vite, etc.)
- Compatible with React Native via AsyncStorage
- No provider setup required
- Built on SWR for optimal caching and revalidation
- Supports SSR/SSG with proper hydration
