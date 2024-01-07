import React from "react";
import Head from "next/head";
import { useQuery } from "@apollo/client";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";

import { SearchInput } from "../components/SearchInput";
import { GET_REACT_REPOSITORIES } from "../queries";
import { RepositoryTable } from "../components/RepositoryTable";
import { type SearchResults } from "../types";

const ITEMS_PER_PAGE = 10;

export default function App() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // HACK: This is a workaround because the `loading` bool returned from useQuery is not updated, even when fetchMore resolves.
  // Similar issue: https://stackoverflow.com/questions/72083468/loading-remains-true-when-loading-data-with-usequery-using-apolloclient-in#comment133130739_72208553
  const [loading, setLoading] = React.useState(true);
  const isInitialRender = React.useRef(true);
  const [data, setData] = React.useState<SearchResults | null>(null);

  const {
    error,
    data: initialData,
    fetchMore,
  } = useQuery<SearchResults>(GET_REACT_REPOSITORIES, {
    variables: {
      query: `topic:react ${decodeURI(searchParams.get("query") ?? "")}`.trim(),
      first: ITEMS_PER_PAGE,
      last: null,
      before: searchParams.get("page"),
      after: null,
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

      if (!value) {
        searchParams.delete(key);
      } else {
        searchParams.set(key, encodeURI(value));
      }

      const queryString = searchParams.toString();
      const uri = queryString
        ? `${window.location.pathname}?${queryString}`
        : window.location.pathname;

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
          query: `topic:react ${decodeURI(
            searchParams.get("query") ?? "",
          )}`.trim(),
          first: ITEMS_PER_PAGE,
          last: null, // NOTE: Reset cache
          before: null, // NOTE: Reset cache
          after: data.search.pageInfo.endCursor,
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
          query: `topic:react ${decodeURI(
            searchParams.get("query") ?? "",
          )}`.trim(),
          first: null, // NOTE: Reset cache
          last: ITEMS_PER_PAGE,
          before: data.search.pageInfo.startCursor,
          after: null, // NOTE: Reset cache
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
      if (isInitialRender.current) {
        isInitialRender.current = false;
        return;
      }

      const performSearch = async () => {
        setLoading(true);
        setQueryStringParameter("page", "", true);

        const q = `topic:react ${searchInput}`.trim();
        const fetchedData = await fetchMore({
          variables: {
            query: q,
            first: ITEMS_PER_PAGE,
            last: null, // NOTE: Reset cache
            before: null, // NOTE: Reset cache
            after: null, // NOTE: Reset cache
          },
        });

        setQueryStringParameter("query", searchInput, true);
        setData(fetchedData.data);
        setLoading(false);
      };
      void performSearch();
    },
    [fetchMore, setQueryStringParameter],
  );

  return (
    <>
      <Head>
        <title>Test Application</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="prose relative grid max-w-prose p-6 font-sans">
        <h1>Test Application</h1>

        <div className="flex h-4" role="status">
          {loading ? (
            <div className="absolute right-0 top-0 p-8">
              <div className="flex items-center gap-2">
                <span className="invisible sm:visible">Loading</span>
                <ReloadIcon className="h-4 w-4 animate-spin" />
              </div>
            </div>
          ) : null}
        </div>
        <div>
          <div className="flex flex-col items-end justify-between gap-8 sm:flex-row">
            <SearchInput onSearch={handleDebouncedSearch} />

            <div className="flex justify-between gap-4 md:justify-end ">
              <Button
                disabled={!data?.search.pageInfo.hasPreviousPage || loading}
                onClick={handlePrevious}
                className="focus:ring-2 focus:ring-offset-2 focus:ring-offset-border"
              >
                Back
              </Button>
              <Button
                disabled={!data?.search.pageInfo.hasNextPage || loading}
                onClick={handleNext}
                className="focus:ring-2 focus:ring-offset-2 focus:ring-offset-border"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
        {error ? (
          <p className="text-xl text-destructive">Error: {error.message}</p>
        ) : null}
        {error ?? (!loading && data?.search.edges.length === 0) ? (
          <p className="text-xl">No results found</p>
        ) : (
          <RepositoryTable
            data={data?.search.edges}
            loading={loading}
            aria-busy={loading}
          />
        )}
      </main>
    </>
  );
}
