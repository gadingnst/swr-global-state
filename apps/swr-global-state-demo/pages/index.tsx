/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import SetCount from '../components/SetCount';
import GetCount from '../components/GetCount';

const Home = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src="/logo.svg" className="App-logo" alt="logo" />
        <p>
          This is Home page.
        </p>
        <br />
        <p style={{ fontSize: 14, marginTop: -20 }}>
          See About page to make sure that state will be there.
          <br />
          Refresh the page to make sure that persisted & normal state are different.
        </p>
        <SetCount />
        <br />
        <GetCount />
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <Link className="App-link" href="/about">
            Go To About
          </Link>
          <Link className="App-link" href="/async-demo">
            Try Async Storage Demo
          </Link>
          <Link className="App-link" href="/test-input">
            Test Input
          </Link>
        </div>
      </header>
    </div>
  );
};

export default Home;
