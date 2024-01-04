import Head from "next/head";
import { useQuery } from "@apollo/client";
import { GET_REACT_REPOSITORIES } from "../queries";
import type { SearchResults, RepositoryEdge } from "../types";

export default function Home() {
  const { loading, error, data } = useQuery<SearchResults>(
    GET_REACT_REPOSITORIES,
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error </p>;

  return (
    <>
      <Head>
        <title>Test Application</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="prose font-sans">
        <h1>Test Application</h1>
        <ul>
          {data?.search.edges.map((edge: RepositoryEdge) => (
            <li key={edge.node.name}>
              <a href={edge.node.url} target="_blank" rel="noopener noreferrer">
                {edge.node.name}
              </a>{" "}
              - Stars: {edge.node.stargazers.totalCount}
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
