/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import GetCount from '../components/GetCount';
import SetCount from '../components/SetCount';

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
        <Link className="App-link" href="/about">
          Go To About
        </Link>
      </header>
    </div>
  );
};

export default Home;
