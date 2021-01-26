import { ApolloProvider } from "@apollo/client";
import { ColorModeProvider, CSSReset, ThemeProvider } from "@chakra-ui/react";
import { AppProps } from "next/dist/next-server/lib/router/router";
import theme from "../theme";
import { useApollo } from "../utils/apolloClient";

function MyApp({ Component, pageProps }: AppProps) {
  const apolloClient = useApollo(pageProps);

  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider theme={theme}>
        <ColorModeProvider
          options={{
            useSystemColorMode: true,
          }}
        >
          <CSSReset />
          <Component {...pageProps} />
        </ColorModeProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default MyApp;
