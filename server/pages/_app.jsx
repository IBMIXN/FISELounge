import Head from "next/head";
import { SWRConfig } from "swr";
import { ThemeProvider, CSSReset, DarkMode, useToast } from "@chakra-ui/core";

import theme from "../theme";
import "../utils/global.css";

const App = ({ Component, pageProps }) => {
  const toast = useToast();
  return (
    <ThemeProvider theme={theme}>
      <SWRConfig
        value={{
          onError: (error, key) => {
            if (error.status !== 403 && error.status !== 404) {
              // We can send the error to Sentry,
              // or show a notification UI.
            }
          },
        }}
      >
        <DarkMode>
          <Head>
            <title>FISE Dashboard</title>
            <link
              rel="apple-touch-icon"
              sizes="180x180"
              href="/icons/apple-touch-icon.png"
            />
            <link
              rel="icon"
              type="image/png"
              sizes="32x32"
              href="/icons/favicon-32x32.png"
            />
            <link
              rel="icon"
              type="image/png"
              sizes="16x16"
              href="/icons/favicon-16x16.png"
            />
            <link rel="manifest" href="/icons/site.webmanifest" />
            <link
              rel="mask-icon"
              href="/icons/safari-pinned-tab.svg"
              color="#5bbad5"
            />
            <link rel="shortcut icon" href="/icons/favicon.ico" />
            <meta name="msapplication-TileColor" content="#da532c" />
            <meta
              name="msapplication-config"
              content="/icons/browserconfig.xml"
            />
            <meta name="theme-color" content="#ffffff"></meta>
          </Head>
          <CSSReset />
          <Component {...pageProps} />
        </DarkMode>
      </SWRConfig>
    </ThemeProvider>
  );
};

export default App;
