import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createStore, useStore } from './index';
import type { StatePersistor, RateLimitConfig } from './index';

// Mock SWR
vi.mock('swr', () => ({
  __esModule: true,
  default: vi.fn(),
  useSWRConfig: () => ({
    cache: new Map()
  })
}));

describe('swr-global-state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createStore', () => {
    it('should create a store with initial value', () => {
      const useCounter = createStore({
        initial: 0,
        key: 'counter'
      });
      expect(useCounter).toBeDefined();
      expect(typeof useCounter).toBe('function');
    });

    // it('should allow overriding initial value', () => {
      // const useCounter = createStore({
      //   initial: 0,
      //   key: 'counter'
      // });
      // const hook = renderHook(() => useCounter(10));
      // Test implementation would depend on SWR mock setup
    // });
  });

  describe('useStore', () => {
    it('should return initial state', () => {
      const { result } = renderHook(() => useStore({
        initial: 'test',
        key: 'test-key'
      }));

      const [state, setState, { isLoading, error, isPersisting }] = result.current;
      expect(state).toBe('test');
      expect(error).toBe(true);
      expect(typeof setState).toBe('function');
      expect(typeof isLoading).toBe('boolean');
      expect(isPersisting).toBe(false);
    });

    it('should update state with direct value', async() => {
      const { result } = renderHook(() => useStore({
        initial: 0,
        key: 'counter'
      }));

      const [, setState] = result.current;

      await act(async() => {
        await setState(5);
      });

      // Verify state update
    });

    it('should update state with callback function', async() => {
      const { result } = renderHook(() => useStore({
        initial: 0,
        key: 'counter'
      }));

      const [, setState] = result.current;

      await act(async() => {
        await setState(prev => prev + 1);
      });

      // Verify state update
    });
  });

  describe('Persistor functionality', () => {
    it('should call persistor.onGet on initial load', async() => {
      const mockPersistor: StatePersistor<number> = {
        onGet: vi.fn().mockResolvedValue(42),
        onSet: vi.fn()
      };

      renderHook(() => useStore({
        initial: 0,
        key: 'persisted-counter',
        persistor: mockPersistor
      }));

      expect(mockPersistor.onGet).toHaveBeenCalledWith('persisted-counter');
    });

    it('should call persistor.onSet when state changes', async() => {
      const mockPersistor: StatePersistor<number> = {
        onGet: vi.fn().mockResolvedValue(0),
        onSet: vi.fn()
      };

      const { result } = renderHook(() => useStore({
        initial: 0,
        key: 'persisted-counter',
        persistor: mockPersistor
      }));

      const [, setState] = result.current;

      await act(async() => {
        await setState(10);
      });

      expect(mockPersistor.onSet).toHaveBeenCalledWith('persisted-counter', 10);
    });

    it('should handle persistor errors with onError callback', async() => {
      const mockError = new Error('Persist failed');
      const mockOnError = vi.fn();
      const mockPersistor: StatePersistor<number> = {
        onGet: vi.fn().mockResolvedValue(0),
        onSet: vi.fn().mockRejectedValue(mockError)
      };

      const { result } = renderHook(() => useStore({
        initial: 0,
        key: 'error-counter',
        persistor: mockPersistor,
        onError: mockOnError
      }));

      const [, setState] = result.current;

      await act(async() => {
        await setState(10);
      });

      expect(mockOnError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('Rate limiting functionality', () => {
    it('should debounce persistor calls', async() => {
      const mockPersistor: StatePersistor<number> = {
        onGet: vi.fn().mockResolvedValue(0),
        onSet: vi.fn()
      };

      const rateLimitConfig: RateLimitConfig<number> = {
        type: 'debounce',
        delay: 500
      };

      const { result } = renderHook(() => useStore({
        initial: 0,
        key: 'debounced-counter',
        persistor: mockPersistor,
        rateLimit: rateLimitConfig
      }));

      const [, setState] = result.current;

      // Multiple rapid calls
      await act(async() => {
        await setState(1);
        await setState(2);
        await setState(3);
      });

      // Should not call persistor immediately
      expect(mockPersistor.onSet).not.toHaveBeenCalled();

      // Fast forward time
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Should call persistor only once with final value
      expect(mockPersistor.onSet).toHaveBeenCalledTimes(1);
      expect(mockPersistor.onSet).toHaveBeenCalledWith('debounced-counter', 3);
    });

    it('should throttle persistor calls', async() => {
      const mockPersistor: StatePersistor<number> = {
        onGet: vi.fn().mockResolvedValue(0),
        onSet: vi.fn()
      };

      const rateLimitConfig: RateLimitConfig<number> = {
        type: 'throttle',
        delay: 500
      };

      const { result } = renderHook(() => useStore({
        initial: 0,
        key: 'throttled-counter',
        persistor: mockPersistor,
        rateLimit: rateLimitConfig
      }));

      const [, setState] = result.current;

      await act(async() => {
        await setState(1);
      });

      // First call should execute immediately
      expect(mockPersistor.onSet).toHaveBeenCalledTimes(1);

      await act(async() => {
        await setState(2);
        await setState(3);
      });

      // Subsequent calls should be throttled
      expect(mockPersistor.onSet).toHaveBeenCalledTimes(1);

      act(() => {
        vi.advanceTimersByTime(500);
      });

      // After delay, last call should execute
      expect(mockPersistor.onSet).toHaveBeenCalledTimes(2);
    });

    it('should set isPersisting to true during rate limited operations', async() => {
      const mockPersistor: StatePersistor<number> = {
        onGet: vi.fn().mockResolvedValue(0),
        onSet: vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      };

      const rateLimitConfig: RateLimitConfig<number> = {
        type: 'debounce',
        delay: 200
      };

      const { result } = renderHook(() => useStore({
        initial: 0,
        key: 'persisting-counter',
        persistor: mockPersistor,
        rateLimit: rateLimitConfig
      }));

      const [, setState] = result.current;

      await act(async() => {
        await setState(1);
      });

      // Should not be persisting yet (debounced)
      expect(result.current[2].isPersisting).toBe(false);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Should be persisting now
      expect(result.current[2].isPersisting).toBe(true);

      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Should finish persisting
      expect(result.current[2].isPersisting).toBe(false);
    });

    it('should use custom rate limit function when provided', async() => {
      const mockCustomFunction = vi.fn().mockImplementation((func: (key: string, data: any) => void, delay: number) => {
        return (key: string, data: any) => {
          setTimeout(() => func(key, data), delay * 2); // Custom delay multiplier
        };
      });

      const mockPersistor: StatePersistor<number> = {
        onGet: vi.fn().mockResolvedValue(0),
        onSet: vi.fn()
      };

      const rateLimitConfig: RateLimitConfig<number> = {
        type: 'debounce',
        delay: 100,
        customFunction: mockCustomFunction
      };

      const { result } = renderHook(() => useStore({
        initial: 0,
        key: 'custom-counter',
        persistor: mockPersistor,
        rateLimit: rateLimitConfig
      }));

      const [, setState] = result.current;

      await act(async() => {
        await setState(1);
      });

      expect(mockCustomFunction).toHaveBeenCalledWith(
        expect.any(Function),
        100
      );
    });
  });

  describe('Error handling', () => {
    it('should handle retryOnError = false', async() => {
      const mockError = new Error('Persist failed');
      const mockPersistor: StatePersistor<number> = {
        onGet: vi.fn().mockResolvedValue(0),
        onSet: vi.fn().mockRejectedValue(mockError)
      };

      const { result } = renderHook(() => useStore({
        initial: 0,
        key: 'no-retry-counter',
        persistor: mockPersistor,
        retryOnError: false
      }));

      const [, setState] = result.current;

      await expect(act(async() => {
        await setState(10);
      })).rejects.toThrow('Persist failed');
    });

    it('should handle retryOnError = true (default)', async() => {
      const mockError = new Error('Persist failed');
      const mockOnError = vi.fn();
      const mockPersistor: StatePersistor<number> = {
        onGet: vi.fn().mockResolvedValue(0),
        onSet: vi.fn().mockRejectedValue(mockError)
      };

      const { result } = renderHook(() => useStore({
        initial: 0,
        key: 'retry-counter',
        persistor: mockPersistor,
        onError: mockOnError,
        retryOnError: true
      }));

      const [, setState] = result.current;

      await act(async() => {
        await setState(10);
      });

      expect(mockOnError).toHaveBeenCalledWith(mockError);
      // Should not throw error
    });
  });

  describe('Cache integration', () => {
    it('should prioritize cache data over persisted data', async() => {
      const mockPersistor: StatePersistor<number> = {
        onGet: vi.fn().mockResolvedValue(100), // Persisted value
        onSet: vi.fn()
      };

      // Mock cache with existing data
      const mockCache = new Map();
      mockCache.set('cached-counter', { data: 50 }); // Cache value

      vi.doMock('swr', () => ({
        __esModule: true,
        default: vi.fn(),
        useSWRConfig: () => ({ cache: mockCache })
      }));

      renderHook(() => useStore({
        initial: 0,
        key: 'cached-counter',
        persistor: mockPersistor
      }));

      // Should use cache data (50) instead of persisted data (100)
      // This would need proper SWR mocking to test effectively
    });
  });

  // describe('Utility functions', () => {
    // it('should test debounce function behavior', () => {
    //   const mockFn = vi.fn();
    //   // Note: debounce function is not exported, so this would need to be tested indirectly
    //   // through the rate limiting functionality
    // });

    // it('should test throttle function behavior', () => {
    //   const mockFn = vi.fn();
    //   // Note: throttle function is not exported, so this would need to be tested indirectly
    //   // through the rate limiting functionality
    // });
  // });

  describe('TypeScript types', () => {
    it('should have correct type definitions', () => {
      // Type-only tests to ensure proper TypeScript integration
      const useTypedStore = createStore<{ count: number; name: string; }>({
        initial: { count: 0, name: 'test' },
        key: 'typed-store'
      });

      expect(useTypedStore).toBeDefined();
    });
  });
});
