import Link from 'next/link';
import AsyncCounter from '../components/AsyncCounter';
import AsyncProfile from '../components/AsyncProfile';
import RateLimitDemo from '../components/RateLimitDemo';

const AsyncDemo = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src="/logo.svg" className="App-logo" alt="logo" />
        <h1 style={{ color: 'aquamarine', marginBottom: '20px' }}>
          Async Storage & Rate Limiting Demo
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '20px',
          maxWidth: '1200px',
          width: '100%'
        }}>
          <AsyncCounter />
          <AsyncProfile />
          <RateLimitDemo />
        </div>

        <div style={{ marginTop: '30px' }}>
          <h3>Rate Limiting Strategies Used:</h3>
          <ul style={{ textAlign: 'left', maxWidth: '600px' }}>
            <li><strong>Counter:</strong> Debounce (500ms) - Batches rapid increments</li>
            <li><strong>Profile:</strong> Throttle (1s) - Limits profile updates frequency</li>
            <li><strong>Search:</strong> Throttle (2s) - Prevents excessive search logging</li>
            <li><strong>Count Persisted:</strong> Custom function - Hybrid approach</li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
          <Link className="App-link" href="/">
            ← Back to Home
          </Link>
          <Link className="App-link" href="/about">
            Go to About →
          </Link>
        </div>

        <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          <p>💡 Open browser console to see rate limiting in action!</p>
          <p>🔄 Try rapid clicking/typing to observe debounce and throttle behaviors</p>
        </div>
      </header>
    </div>
  );
};

export default AsyncDemo;
