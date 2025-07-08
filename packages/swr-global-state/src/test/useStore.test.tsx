import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { describe, expect, it, vi } from 'vitest';
import { useStore, createStore } from '../index';

/**
 * Wrapper component for testing with SWR provider
 */
function createWrapper() {
  return function Wrapper({ children }: { children: React.ReactNode; }) {
    return (
      <SWRConfig value={{ provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );
  };
}

describe('useStore', () => {
  it('should initialize with initial value', () => {
    const { result } = renderHook(
      () => useStore({ key: 'test-key', initial: 'initial-value' }),
      { wrapper: createWrapper() }
    );

    const [state] = result.current;
    expect(state).toBe('initial-value');
  });

  it('should update state when setState is called', async() => {
    const { result } = renderHook(
      () => useStore({ key: 'test-key-2', initial: 0 }),
      { wrapper: createWrapper() }
    );

    const [, setState] = result.current;

    act(() => {
      setState(42);
    });

    await waitFor(() => {
      const [state] = result.current;
      expect(state).toBe(42);
    });
  });

  it('should update state with callback function', async() => {
    const { result } = renderHook(
      () => useStore({ key: 'test-key-3', initial: 10 }),
      { wrapper: createWrapper() }
    );

    const [, setState] = result.current;

    act(() => {
      setState((prev) => prev + 5);
    });

    await waitFor(() => {
      const [state] = result.current;
      expect(state).toBe(15);
    });
  });

  it('should handle persistor onSet and onGet', async() => {
    const mockOnSet = vi.fn();
    const mockOnGet = vi.fn().mockResolvedValue('persisted-value');

    const { result } = renderHook(
      () => useStore({
        key: 'test-key-4',
        initial: 'initial',
        persistor: {
          onSet: mockOnSet,
          onGet: mockOnGet
        }
      }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(mockOnGet).toHaveBeenCalledWith('test-key-4');
    });

    const [, setState] = result.current;

    act(() => {
      setState('new-value');
    });

    await waitFor(() => {
      expect(mockOnSet).toHaveBeenCalledWith('test-key-4', 'new-value');
    });
  });

  it('should handle error in persistor', async() => {
    const mockOnError = vi.fn();
    const mockOnSet = vi.fn().mockRejectedValue(new Error('Persist error'));

    const { result } = renderHook(
      () => useStore({
        key: 'test-key-5',
        initial: 'initial',
        persistor: {
          onSet: mockOnSet,
          onGet: vi.fn().mockResolvedValue('initial')
        },
        onError: mockOnError,
        retryOnError: false
      }),
      { wrapper: createWrapper() }
    );

    const [, setState] = result.current;

    await act(async() => {
      try {
        await setState('new-value');
      } catch (error) {
        // Expected error
      }
    });

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});

describe('createStore', () => {
  it('should create a store hook with predefined configuration', () => {
    const useCounterStore = createStore({
      key: 'counter',
      initial: 0
    });

    const { result } = renderHook(
      () => useCounterStore(),
      { wrapper: createWrapper() }
    );

    const [state] = result.current;
    expect(state).toBe(0);
  });

  it('should override initial value when provided', () => {
    const useCounterStore = createStore({
      key: 'counter-2',
      initial: 0
    });

    const { result } = renderHook(
      () => useCounterStore(100),
      { wrapper: createWrapper() }
    );

    const [state] = result.current;
    expect(state).toBe(100);
  });
});
