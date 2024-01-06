import React from "react";
import Head from "next/head";
import { useQuery } from "@apollo/client";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";

import { DebouncedSearchInput } from "../components/DebouncedSearchInput";
import { GET_REACT_REPOSITORIES } from "../queries";
import { RepositoryTable } from "../components/RepositoryTable";
import { type SearchResults } from "../types";

const ITEMS_PER_PAGE = 10;

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // NOTE: This is a workaround because the `loading` bool returned from useQuery is not updated, even when fetchMore resolves.
  // See: https://stackoverflow.com/questions/72083468/loading-remains-true-when-loading-data-with-usequery-using-apolloclient-in#comment133130739_72208553
  const [loading, setLoading] = React.useState(true);

  const [data, setData] = React.useState<SearchResults | null>(null);
  const {
    error,
    data: initialData,
    fetchMore,
  } = useQuery<SearchResults>(GET_REACT_REPOSITORIES, {
    variables: {
      first: ITEMS_PER_PAGE,
      before: searchParams.get("page"),
      query: "topic:react",
    },
    notifyOnNetworkStatusChange: true,
  });

  React.useEffect(() => {
    if (data === null && initialData) {
      setData(initialData);
      setLoading(false);
    }
  }, [data, initialData]);

  const setQueryStringParameter = React.useCallback(
    (key: string, value: string, replace = false) => {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set(key, encodeURI(value));
      const uri = `${window.location.pathname}?${searchParams.toString()}`;
      if (replace) {
        router.push(uri);
      } else {
        router.replace(uri);
      }
    },
    [router],
  );

  const handleNext = async () => {
    if (data?.search.pageInfo.hasNextPage) {
      setLoading(true);
      const fetchedData = await fetchMore({
        variables: {
          first: ITEMS_PER_PAGE,
          after: data.search.pageInfo.endCursor,
          last: null, // NOTE: Reset cache
          before: null, // NOTE: Reset cache
          query: decodeURI(searchParams.get("query") ?? "topic:react"),
        },
      });

      setQueryStringParameter(
        "page",
        fetchedData.data.search.pageInfo.startCursor,
      );

      setData(fetchedData.data);
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
          query: decodeURI(searchParams.get("query") ?? "topic:react"),
        },
      });
      setQueryStringParameter(
        "page",
        fetchedData.data.search.pageInfo.startCursor,
      );

      setData(fetchedData.data);
      setLoading(false);
    }
  };

  const handleDebouncedSearch = React.useCallback(
    (searchInput: string) => {
      const performSearch = async () => {
        setLoading(true);

        const q = `topic:react ${searchInput}`;

        const fetchedData = await fetchMore({
          variables: {
            query: q,
            first: ITEMS_PER_PAGE,
            last: null, // NOTE: Reset cache
            before: null, // NOTE: Reset cache
          },
        });

        setQueryStringParameter("query", q, true);
        setData(fetchedData.data);
        setLoading(false);
      };
      void performSearch();
    },
    [fetchMore, setQueryStringParameter],
  );

  if (error) return <p>Error: {error.message}</p>;
  // if (!loading && data?.search.edges.length === 0) return <p>No data found</p>;

  return (
    <>
      <Head>
        <title>Test Application</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="prose p-8 font-mono">
        <h1>Test Application</h1>
        <div>
          <div className="flex items-center justify-between">
            <DebouncedSearchInput onSearch={handleDebouncedSearch} />
            <div className="flex h-4">
              {loading ? (
                <div className="flex items-center">
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : null}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                disabled={!data?.search.pageInfo.hasPreviousPage || loading}
                onClick={handlePrevious}
              >
                Back
              </Button>
              <Button
                disabled={!data?.search.pageInfo.hasNextPage || loading}
                onClick={handleNext}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
        <RepositoryTable
          data={data?.search.edges}
          loading={loading}
          aria-busy={loading}
        />
      </main>
    </>
  );
}
