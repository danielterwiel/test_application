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
          query: decodeURI(searchParams.get("query") ?? "topic:react"),
          before: null, // NOTE: Reset cache
          after: data.search.pageInfo.endCursor,
          first: ITEMS_PER_PAGE,
          last: null, // NOTE: Reset cache
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
          query: decodeURI(searchParams.get("query") ?? "topic:react"),
          before: data.search.pageInfo.startCursor,
          after: null, // NOTE: Reset cache
          first: null, // NOTE: Reset cache
          last: ITEMS_PER_PAGE,
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

        const q = `topic:react ${searchInput}`.trim();
        const fetchedData = await fetchMore({
          variables: {
            query: q,
            before: null, // NOTE: Reset cache
            last: null, // NOTE: Reset cache
            first: ITEMS_PER_PAGE,
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
      <main className="prose relative grid max-w-prose p-6 font-mono">
        <h1>Test Application</h1>
        <div className="flex h-4" role="status">
          {loading ? (
            <div className="invsible absolute right-0 top-0 p-8 md:visible">
              <div className="flex items-center">
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            </div>
          ) : null}
        </div>
        <div>
          <div className="flex flex-col items-end justify-between gap-8 md:flex-row">
            <DebouncedSearchInput
              onSearch={handleDebouncedSearch}
              loading={loading}
              setLoading={setLoading}
            />

            <div className="flex justify-between gap-4 md:justify-end ">
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
