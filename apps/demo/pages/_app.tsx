import '../styles/globals.css';
import type { AppProps } from 'next/app';
import GitHubBadge from '../components/GithubBadge';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <GitHubBadge />
      <Component {...pageProps} />
    </>
  );
}
export default MyApp;
