import "../styles/globals.css";
import "../styles/matsumotoClarity.css";
import "../styles/theoremJourney.css";
import "../styles/theoremJourneyOverrides.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
