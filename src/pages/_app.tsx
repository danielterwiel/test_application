import { type AppType } from "next/dist/shared/lib/utils";
import React from "react";
import { ApolloProvider } from "@apollo/client";
import { client } from "../apolloClient";

import "~/src/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <React.StrictMode>
      <ApolloProvider client={client}>
        <Component {...pageProps} />
      </ApolloProvider>
    </React.StrictMode>
  );
};

export default MyApp;
