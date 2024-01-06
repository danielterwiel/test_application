import React from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { type SearchResults } from "../types";

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

export const Search = ({
  setLoading,
  setData,
  data,
  fetchMore,
}: {
  setLoading: (loading: boolean) => void;
  setData: (data: SearchResults) => void;
  data: SearchResults | null;
  fetchMore: (options: {
    variables: {
      first: number;
      after: string | null;
      last: null;
      before: null;
      query: string;
    };
  }) => Promise<{ data: SearchResults }>;
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const initialQuery = decodeURI(searchParams.get("query") ?? "").trim();
  const [query, setQuery] = React.useState(initialQuery);

  const debouncedSetSearchParams = debounce(setSearchParams, 250);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event?.target?.value;
    setQuery(value);
    debouncedSetSearchParams(value);
  };

  function setSearchParams(query: string) {
    const encodedValue = encodeURI(query);
    const url = encodedValue ? `${pathname}?query=${encodedValue}` : pathname;
    router.replace(url);
    void search();
  }

  async function search() {
    setLoading(true);

    const fetchedData = await fetchMore({
      variables: {
        first: 10,
        after: data?.search.pageInfo.endCursor,
        last: null, // NOTE: Reset cache
        before: null, // NOTE: Reset cache
        query,
      },
    });

    setData(fetchedData.data);
    setLoading(false);
  }

  return (
    <form>
      <Input
        className="w-full"
        placeholder="e.g. @tanstack/table"
        value={query}
        onChange={handleInputChange}
      />
    </form>
  );
};
