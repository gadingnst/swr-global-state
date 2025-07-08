import type { Key } from 'swr';

export type RateLimitType = 'debounce' | 'throttle';

export type RateLimitConfig<T> = {
  type: RateLimitType;
  delay: number;
  // Optional custom function for advanced use cases
  customFunction?: (func: (key: Key, data: T) => Promise<void>, delay: number) => (key: Key, data: T) => void;
};

/**
 * Enhanced debounce utility function with cleanup
 * @param func Function to debounce
 * @param delay Delay in milliseconds
 * @returns Object with debounced function and cleanup
 */
export function debounceWithCleanup<T extends(...args: any[]) => any>(func: T, delay: number): {
  debouncedFunc: T;
  cleanup: () => void;
} {
  let timeoutId: ReturnType<typeof setTimeout>;

  const debouncedFunc = ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;

  const cleanup = () => {
    clearTimeout(timeoutId);
  };

  return { debouncedFunc, cleanup };
}

/**
 * Enhanced throttle utility function with cleanup
 * @param func Function to throttle
 * @param delay Delay in milliseconds
 * @returns Object with throttled function and cleanup
 */
export function throttleWithCleanup<T extends(...args: any[]) => any>(func: T, delay: number): {
  throttledFunc: T;
  cleanup: () => void;
} {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout>;

  const throttledFunc = ((...args: any[]) => {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        func(...args);
      }, delay - (now - lastCall));
    }
  }) as T;

  const cleanup = () => {
    clearTimeout(timeoutId);
  };

  return { throttledFunc, cleanup };
}

/**
 * Enhanced rate limited function creator with cleanup
 * @param func Function to rate limit
 * @param config Rate limit configuration
 * @param onStart Optional callback when rate limited function starts
 * @param onEnd Optional callback when rate limited function ends
 * @returns Object with rate limited function and cleanup
 */
export function createRateLimitedFunctionWithCleanup<T>(
  func: (key: Key, data: T) => Promise<void>,
  config: RateLimitConfig<T>,
  onStart?: () => void,
  onEnd?: () => void
): {
  rateLimitedFunc: (key: Key, data: T) => void;
  cleanup: () => void;
} {
  if (config.customFunction) {
    return {
      rateLimitedFunc: config.customFunction(func, config.delay),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      cleanup: () => {} // Custom function should handle its own cleanup
    };
  }

  const wrappedFunc = async(key: Key, data: T) => {
    onStart?.();
    try {
      await func(key, data);
    } finally {
      onEnd?.();
    }
  };

  switch (config.type) {
    case 'debounce': {
      const { debouncedFunc, cleanup } = debounceWithCleanup(wrappedFunc, config.delay);
      return { rateLimitedFunc: debouncedFunc, cleanup };
    }
    case 'throttle': {
      const { throttledFunc, cleanup } = throttleWithCleanup(wrappedFunc, config.delay);
      return { rateLimitedFunc: throttledFunc, cleanup };
    }
    default:
      return {
        rateLimitedFunc: wrappedFunc as any,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        cleanup: () => {}
      };
  }
}
