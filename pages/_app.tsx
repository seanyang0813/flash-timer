import "../styles/globals.css";
import "../styles/matsumoto3d.css";
import "../styles/matsumotoMobileFix.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
