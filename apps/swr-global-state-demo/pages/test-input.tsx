import { useStore } from 'swr-global-state';

const TestInputPage = () => {
  const [prompt, setPrompt] = useStore({
    key: 'agi-creator-gen-image-prompt',
    initial: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Test Input - Cursor Jump Fix</h1>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="prompt-input" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Image Prompt:
        </label>
        <input
          id="prompt-input"
          type="text"
          value={prompt}
          onChange={handleChange}
          placeholder="Type your image prompt here..."
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#007acc';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#ddd';
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p><strong>Current Value:</strong> {prompt || '(empty)'}</p>
        <p><strong>Length:</strong> {prompt.length} characters</p>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setPrompt('')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear
        </button>
        <button
          onClick={() => setPrompt('A beautiful sunset over mountains')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sample Text
        </button>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>Test Instructions:</h3>
        <ol>
          <li>Type in the input field above</li>
          <li>Check if cursor stays in position while typing</li>
          <li>Try typing fast to test responsiveness</li>
          <li>Use Clear/Sample buttons to test state updates</li>
        </ol>
      </div>
    </div>
  );
};

export default TestInputPage;
