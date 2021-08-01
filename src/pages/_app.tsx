import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { IconContext } from "react-icons/lib";
import { Provider } from "@/providers/Njahit";
import '@/styles/global.css';
import '@/register';


const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "#313131",
        color: "white",
        fontFamily: "'IBM Plex Mono', monospace",
      },
    },
  },
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
});

export default function Njahit({ Component, pageProps }: AppProps) {
  return <Provider>
    <IconContext.Provider value={{ color: "#fff" }}>
      <ChakraProvider theme={theme}>
        <Head>
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;600&display=swap"
            rel="stylesheet"
          />
        </Head>
        <Component {...pageProps} />
      </ChakraProvider>
    </IconContext.Provider>
  </Provider>;
}
