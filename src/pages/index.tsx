import Head from "next/head";
import { useQuery } from "@apollo/client";
import { GET_REACT_REPOSITORIES } from "../queries";
import type { SearchResults } from "../types";
import { Table } from "../components/Table";

export default function Home() {
  const { loading, error, data } = useQuery<SearchResults>(
    GET_REACT_REPOSITORIES,
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error </p>;
  if (!data || data?.search.edges.length === 0) return <p>No data found</p>;

  return (
    <>
      <Head>
        <title>Test Application</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="prose p-8 font-mono">
        <h1>Test Application</h1>
        <Table data={data.search.edges} />
      </main>
    </>
  );
}
