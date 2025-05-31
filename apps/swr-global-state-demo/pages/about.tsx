/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import useCount from '../states/stores/count';
import useCountPersisted from '../states/stores/count-persisted';
import useData from '../states/stores/data';

const About = () => {
  const [count] = useCount();
  const [countPersist] = useCountPersisted();
  const { data, login, logout, error, isLoading } = useData();

  const renderData = () => {
    let msg = '';
    if (isLoading) {
      msg = 'Loading...';
    } else if (error) {
      msg = 'You must login before see the data';
    } else if (data) {
      msg = `By: ${data?.maintaner || '-'}`;
    }
    return (
      <p style={{ fontSize: 14 }}>
        {msg}
      </p>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src="/logo.svg" className="App-logo" alt="logo" />
        <p style={{ color: 'aquamarine' }}>
          This is About Page.
        </p>
        {renderData()}
        <div style={{ display: 'flex' }}>
          <button onClick={login} style={{ marginRight: 10 }}>
            Login
          </button>
          <button onClick={logout}>
            Destroy Data
          </button>
        </div>
        <p>
          Count from Home: {count}
          <br />
          Count from Home (Persisted): {countPersist}
        </p>
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <Link className="App-link" href="/">
            Go To Home
          </Link>
          <Link className="App-link" href="/async-demo">
            Try Async Storage Demo
          </Link>
        </div>
      </header>
    </div>
  );
};

export default About;
