import React from "react";
import Head from "next/head";
import { useQuery } from "@apollo/client";
import { GET_REACT_REPOSITORIES } from "../queries";
import type { SearchResults } from "../types";
import { RepositoryTable } from "../components/RepositoryTable";

export default function Home() {
  const [after, setAfter] = React.useState<string | null>(null);
  const [before, setBefore] = React.useState<string | null>(null);
  const [isNext, setIsNext] = React.useState<boolean>(true);

  const {
    loading,
    error,
    data: initialData,
    fetchMore,
  } = useQuery<SearchResults>(GET_REACT_REPOSITORIES, {
    variables: {
      after,
      before,
      first: isNext ? 10 : undefined,
      last: !isNext ? 10 : undefined,
    },
  });

  const [data, setData] = React.useState<SearchResults | null>(
    initialData ?? null,
  );

  React.useEffect(() => {
    if (!loading && initialData && !error) {
      setData(initialData);
    }
  }, [loading, initialData, error]);

  const handleNext = async () => {
    if (data?.search.pageInfo.hasNextPage) {
      setIsNext(true);
      await fetchMore({
        variables: {
          after: data.search.pageInfo.endCursor,
          first: 10,
        },
      }).then((fetchedData) => {
        setData(fetchedData.data);
        setAfter(fetchedData.data.search.pageInfo.endCursor);
        setBefore(null);
      });
    }
  };

  const handleBack = async () => {
    if (data?.search.pageInfo.hasPreviousPage) {
      setIsNext(false);
      await fetchMore({
        variables: {
          before: data.search.pageInfo.startCursor,
          last: 10,
        },
      }).then((fetchedData) => {
        setData(fetchedData.data);
        setBefore(fetchedData.data.search.pageInfo.startCursor);
        setAfter(null);
      });
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error </p>;
  if (!data || data.search.edges.length === 0) return <p>No data found</p>;

  return (
    <>
      <Head>
        <title>Test Application</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="prose p-8 font-mono">
        <h1>Test Application</h1>
        <RepositoryTable data={data?.search.edges} />

        <div className="flex gap-4">
          <button
            disabled={
              !data.search.pageInfo.hasPreviousPage || isLoading || loading
            }
            aria-disabled={
              !data.search.pageInfo.hasPreviousPage || isLoading || loading
            }
            className="border-blue disabled:bg-red disabled:bg-red rounded-xl border p-2 hover:bg-black hover:text-white disabled:cursor-not-allowed"
            onClick={handleBack}
          >
            Back
          </button>
          <button
            disabled={!data.search.pageInfo.hasNextPage || isLoading || loading}
            aria-disabled={
              !data.search.pageInfo.hasNextPage || isLoading || loading
            }
            className="border-blue disabled:bg-red disabled:bg-red rounded-xl border p-2 hover:bg-black hover:text-white disabled:cursor-not-allowed"
            onClick={handleNext}
          >
            Next
          </button>
        </div>
      </main>
    </>
  );
}
