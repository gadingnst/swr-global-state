import { useState } from 'react';
import useSearchHistory from '../states/stores/search-history';

function RateLimitDemo() {
  const [searchHistory, setSearchHistory] = useSearchHistory();
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = async() => {
    if (!searchInput.trim()) return;

    await setSearchHistory(prev => ({
      queries: [...prev.queries.slice(-9), searchInput], // Keep last 10
      lastSearch: searchInput,
      searchCount: prev.searchCount + 1
    }));

    setSearchInput('');
  };

  const handleClearHistory = async() => {
    await setSearchHistory({
      queries: [],
      lastSearch: '',
      searchCount: 0
    });
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>Search History (Throttled Rate Limiting)</h3>

      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Type your search..."
          style={{ padding: '8px', width: '200px', marginRight: '10px' }}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} style={{ padding: '8px 16px' }}>
          🔍 Search
        </button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <p><strong>Total Searches:</strong> {searchHistory.searchCount}</p>
        <p><strong>Last Search:</strong> {searchHistory.lastSearch || 'None'}</p>
      </div>

      <div>
        <h4>Recent Searches:</h4>
        {searchHistory.queries.length > 0 ? (
          <ul style={{ maxHeight: '100px', overflowY: 'auto' }}>
            {searchHistory.queries.map((query, index) => (
              <li key={index}>{query}</li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#666' }}>No search history</p>
        )}
      </div>

      <button
        onClick={handleClearHistory}
        style={{ padding: '8px 16px', backgroundColor: '#ff6b6b', color: 'white', marginTop: '10px' }}
      >
        🗑️ Clear History
      </button>

      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        💡 This demo uses <strong>throttle</strong> rate limiting (2s) - rapid searches are limited to prevent excessive storage calls.
      </div>
    </div>
  );
}

export default RateLimitDemo;
