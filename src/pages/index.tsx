import React from "react";
import Head from "next/head";
import { useQuery } from "@apollo/client";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { GET_REACT_REPOSITORIES } from "../queries";
import { Input } from "@/components/ui/input";
import { ReloadIcon } from "@radix-ui/react-icons";
import { RepositoryTable } from "../components/RepositoryTable";
import type { SearchResults } from "../types";

const ITEMS_PER_PAGE = 10;

function debounce<T extends (query: string) => unknown>(
  func: T,
  wait: number,
): (...funcArgs: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(query: string) {
    const later = () => {
      timeout = null;
      func(query);
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}

export default function Home() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const initialQuery = decodeURI(searchParams.get("query") ?? "").trim();
  const [query, setQuery] = React.useState(initialQuery);

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
      query: `topic:react ${query}`,
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

  function setSearchParams(query: string) {
    const encodedValue = encodeURI(query);
    const url = encodedValue ? `${pathname}?search=${encodedValue}` : pathname;
    router.replace(url);
    void search();
  }

  async function search() {
    setLoading(true);

    const fetchedData = await fetchMore({
      variables: {
        first: ITEMS_PER_PAGE,
        after: data?.search.pageInfo.endCursor,
        last: null, // NOTE: Reset cache
        before: null, // NOTE: Reset cache
        query: `topic:react ${query}`,
      },
    });

    setData(fetchedData.data);
    setLoading(false);
  }

  const debouncedSetSearchParams = debounce(setSearchParams, 250);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event?.target?.value;
    setQuery(value);
    debouncedSetSearchParams(value);
  };

  const handleNext = async () => {
    if (data?.search.pageInfo.hasNextPage) {
      setLoading(true);
      const fetchedData = await fetchMore({
        variables: {
          first: ITEMS_PER_PAGE,
          after: data.search.pageInfo.endCursor,
          last: null, // NOTE: Reset cache
          before: null, // NOTE: Reset cache
          query: `topic:react ${query}`,
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

  if (error) return <p>Error: {error.message}</p>;

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
            <form>
              <Input
                className="w-full"
                placeholder="e.g. @tanstack/table"
                value={query}
                onChange={handleInputChange}
              />
            </form>
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
        {!loading && data?.search.edges.length === 0 ? (
          <div className="p-1 text-center">
            <div>No results found for</div>
            <div>&quot;{query}&quot;</div>
          </div>
        ) : null}
        <RepositoryTable data={data?.search.edges} loading={loading} />
      </main>
    </>
  );
}
