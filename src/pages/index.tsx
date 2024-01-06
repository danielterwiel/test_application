import React from "react";
import Head from "next/head";
import { useQuery } from "@apollo/client";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";

import { DebouncedSearchInput } from "../components/DebouncedSearchInput";
import { GET_REACT_REPOSITORIES } from "../queries";
import { RepositoryTable } from "../components/RepositoryTable";
import { type SearchResults } from "../types";

const ITEMS_PER_PAGE = 10;

export default function Home() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [query, setQuery] = React.useState("topic:react");

  // NOTE: This is a workaround because the `loading` bool returned from useQuery is not updated, even when fetchMore resolves.
  // See: https://stackoverflow.com/questions/72083468/loading-remains-true-when-loading-data-with-usequery-using-apolloclient-in#comment133130739_72208553
  const [loading, setLoading] = React.useState(true);

  const [data, setData] = React.useState<SearchResults | null>(null);
  const {
    error,
    data: initialData,
    fetchMore,
    refetch,
  } = useQuery<SearchResults>(GET_REACT_REPOSITORIES, {
    variables: {
      first: ITEMS_PER_PAGE,
      before: searchParams.get("page"),
      query,
    },
    notifyOnNetworkStatusChange: true,
  });

  React.useEffect(() => {
    if (data === null && initialData) {
      setData(initialData);
      setLoading(false);
    }
  }, [data, initialData]);

  const createQueryString = React.useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
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
        },
      });

      const queryString = createQueryString(
        "page",
        fetchedData.data.search.pageInfo.startCursor,
      );
      router.push(pathname + "?" + queryString);

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
        },
      });
      const queryString = createQueryString(
        "page",
        fetchedData.data.search.pageInfo.startCursor,
      );
      router.push(pathname + "?" + queryString);

      setData(fetchedData.data);
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const performSearch = async () => {
      if (query !== "") {
        setLoading(true);

        const fetchedData = await fetchMore({
          variables: {
            query,
            first: ITEMS_PER_PAGE,
            last: null, // NOTE: Reset cache
            before: null, // NOTE: Reset cache
          },
        });

        setData(fetchedData.data);
        setLoading(false);
      }
    };
    void performSearch();
  }, [createQueryString, fetchMore, pathname, query, router, refetch]);

  const handleDebouncedSearch = React.useCallback(
    (q: string) => {
      console.log(q, query);
      if (q !== query) {
        setQuery(q);
      }
    },
    [query],
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
