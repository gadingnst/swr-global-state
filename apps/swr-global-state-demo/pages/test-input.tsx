import { useStore } from 'swr-global-state';

import Link from 'next/link';

const TestInputPage = () => {
  const [prompt, setPrompt] = useStore({
    key: 'agi-creator-gen-image-prompt',
    initial: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  return (
    <div className="App">
      <header className="App-header">
        <p style={{ color: 'aquamarine' }}>
          This is Test Input Page.
        </p>
        <div style={{ marginBottom: '20px', width: '80%' }}>
          <label htmlFor="prompt-input" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: 14 }}>
            Image Prompt:
          </label>
          <textarea
            id="prompt-input"
            value={prompt}
            onChange={handleChange}
            placeholder="Type your image prompt here..."
            className="App-input"
            rows={4}
          />
        </div>

        <div style={{ marginBottom: '20px', fontSize: 14 }}>
          <p><strong>Current Value:</strong> {prompt || '(empty)'}</p>
          <p><strong>Length:</strong> {prompt.length} characters</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setPrompt('')}
            className="App-button"
          >
            Clear
          </button>
          <button
            onClick={() => setPrompt('A beautiful sunset over mountains')}
            className="App-button"
          >
            Sample Text
          </button>
        </div>
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <Link className="App-link" href="/">
            Go To Home
          </Link>
        </div>
      </header>
    </div>
  );
};

export default TestInputPage;
