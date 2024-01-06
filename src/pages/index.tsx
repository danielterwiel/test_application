import React from "react";
import Head from "next/head";
import { useQuery } from "@apollo/client";
import { GET_REACT_REPOSITORIES } from "../queries";
import type { SearchResults } from "../types";
import { RepositoryTable } from "../components/RepositoryTable";

const ITEMS_PER_PAGE = 10;

export default function Home() {
  const [pagination, setPagination] = React.useState<{
    after: string | null;
    before: string | null;
  }>({
    after: null,
    before: null,
  });
  const { after, before } = pagination;

  const {
    error,
    data: initialData,
    fetchMore,
    // refetch,
  } = useQuery<SearchResults>(GET_REACT_REPOSITORIES, {
    variables: { first: ITEMS_PER_PAGE },
    notifyOnNetworkStatusChange: true,
  });
  const [data, setData] = React.useState<SearchResults | null>(null);
  // NOTE: This is a workaround because the `loading` bool returned from useQuery is not updated, even when fetchMore resolves.
  // See: https://stackoverflow.com/questions/72083468/loading-remains-true-when-loading-data-with-usequery-using-apolloclient-in#comment133130739_72208553
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (data === null && initialData) {
      setData(initialData);
      setLoading(false);
    }
  }, [data, initialData]);

  // React.useEffect(() => {
  //   void refetch({ first: ITEMS_PER_PAGE, after: null, before: null });
  // }, [refetch]);

  const handleNext = async () => {
    if (data?.search.pageInfo.hasNextPage) {
      setLoading(true);
      const fetchedData = await fetchMore({
        variables: {
          first: ITEMS_PER_PAGE,
          after: data.search.pageInfo.endCursor,
          last: null, // Reset cache
          before: null, // Reset cache
        },
      });

      setData(fetchedData.data);
      setPagination({
        after: fetchedData.data.search.pageInfo.endCursor,
        before: null,
      });
      setLoading(false);
    }
  };

  const handlePrevious = async () => {
    if (data?.search.pageInfo.hasPreviousPage) {
      setLoading(true);
      const fetchedData = await fetchMore({
        variables: {
          last: ITEMS_PER_PAGE,
          before: data.search.pageInfo.startCursor,
          first: null, // NOTE: Reset cache
          after: null, // NOTE: Reset cache
        },
      });

      setData(fetchedData.data);
      setPagination({
        before: fetchedData.data.search.pageInfo.startCursor,
        after: null,
      });
      setLoading(false);
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
            disabled={!data.search.pageInfo.hasPreviousPage || loading}
            aria-disabled={!data.search.pageInfo.hasPreviousPage || loading}
            className="border-blue disabled:bg-red disabled:bg-red rounded-xl border p-2 hover:bg-black hover:text-white disabled:cursor-not-allowed"
            onClick={handlePrevious}
          >
            Back
          </button>
          <button
            disabled={!data.search.pageInfo.hasNextPage || loading}
            aria-disabled={!data.search.pageInfo.hasNextPage || loading}
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
