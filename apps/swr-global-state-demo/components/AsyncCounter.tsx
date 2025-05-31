import { useState } from 'react';
import useAsyncCounter from '../states/stores/async-counter';

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
    return (
      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>AsyncStorage Counter</h3>
        <p>🔄 Loading from async storage...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', border: '1px solid #f00', borderRadius: '8px' }}>
        <h3>AsyncStorage Counter</h3>
        <p>❌ Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>AsyncStorage Counter</h3>

      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <span style={{ fontSize: '48px', fontWeight: 'bold', color: '#2563eb' }}>
          {counter}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
        <button
          onClick={handleDecrement}
          disabled={isPersisting}
          style={{
            padding: '8px 16px',
            backgroundColor: isPersisting ? '#e5e7eb' : '#ef4444',
            color: isPersisting ? '#9ca3af' : 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isPersisting ? 'not-allowed' : 'pointer'
          }}
        >
          {isPersisting ? '⏳' : '➖'} Decrease
        </button>

        <button
          onClick={handleIncrement}
          disabled={isPersisting}
          style={{
            padding: '8px 16px',
            backgroundColor: isPersisting ? '#e5e7eb' : '#22c55e',
            color: isPersisting ? '#9ca3af' : 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isPersisting ? 'not-allowed' : 'pointer'
          }}
        >
          {isPersisting ? '⏳' : '➕'} Increase
        </button>

        <button
          onClick={handleReset}
          disabled={isPersisting}
          style={{
            padding: '8px 16px',
            backgroundColor: isPersisting ? '#e5e7eb' : '#3b82f6',
            color: isPersisting ? '#9ca3af' : 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isPersisting ? 'not-allowed' : 'pointer'
          }}
        >
          {isPersisting ? '⏳' : '🔄'} Reset
        </button>
      </div>

      {isPersisting && (
        <p style={{ textAlign: 'center', color: '#f59e0b', margin: '10px 0' }}>
          💾 Saving to async storage...
        </p>
      )}

      {isUpdating && !isPersisting && (
        <p style={{ textAlign: 'center', color: '#3b82f6', margin: '10px 0' }}>
          💾 Saving to async storage...
        </p>
      )}

      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
        💡 Values are persisted to AsyncStorage with 500ms debounce.
        <br />
        <span style={{ fontSize: '11px' }}>
          Quick clicks are debounced, so you can click rapidly!
        </span>
      </div>
    </div>
  );
}
