import { ApolloClient, InMemoryCache } from "@apollo/client";
import { env } from "./env";

export const client = new ApolloClient({
  uri: "https://api.github.com/graphql",
  cache: new InMemoryCache(),
  headers: {
    Authorization: `Bearer ${env.NEXT_PUBLIC_GITHUB_API_KEY}`,
  },
});
