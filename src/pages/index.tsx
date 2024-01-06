import Head from "next/head";
import { useQuery } from "@apollo/client";
import { GET_REACT_REPOSITORIES } from "../queries";
import type { SearchResults } from "../types";
import { RepositoryTable } from "../components/RepositoryTable";

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
      <main className="p-8">
        <h1 className="scroll-m-20 pb-10 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Test Application
        </h1>
        <RepositoryTable data={data.search.edges} />
      </main>
    </>
  );
}
