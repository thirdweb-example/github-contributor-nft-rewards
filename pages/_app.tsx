import { ThirdwebProvider } from "@thirdweb-dev/react";
import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";
import "../styles/globals.css";

// This is the chain your dApp will work on.
const activeChain = "goerli";

const MyApp = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) => {
  return (
    <ThirdwebProvider
      activeChain={activeChain}
      authConfig={{
        authUrl: "/api/thirdwebauth",
        domain: process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN as string,
      }}
    >
      <SessionProvider session={session} refetchInterval={0}>
        <Component {...pageProps} />
      </SessionProvider>
    </ThirdwebProvider>
  );
};

export default MyApp;
