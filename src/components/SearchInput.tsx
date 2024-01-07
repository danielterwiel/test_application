import React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useSearchParams } from "next/navigation";

function useDebouncedSearchTerm(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const SearchInput = React.memo(function SearchInput({
  onSearch,
}: {
  onSearch: (searchTerm: string) => void;
}) {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const debouncedSearchTerm = useDebouncedSearchTerm(searchTerm, 300);
  const isInitialRender = React.useRef(true);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const initialQuery = decodeURI(searchParams.get("query") ?? "").trim();

  React.useEffect(() => {
    if (!inputRef.current) {
      return;
    }
    if (document.activeElement !== inputRef.current) {
      setSearchTerm(initialQuery);
    }
  }, [initialQuery]);

  React.useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="flex w-full flex-col gap-1">
      <Label htmlFor="search-input">
        <span>Search</span>
      </Label>

      <div className="relative flex">
        <Input
          type="text"
          id="search-input"
          value={searchTerm}
          onChange={handleChange}
          role="search"
          ref={inputRef}
          placeholder="e.g. @tanstack/table"
          className="pl-8 focus:ring-2 focus:ring-offset-2 focus:ring-offset-border"
        />
        <div className="absolute pl-2 pt-2.5">
          <MagnifyingGlassIcon className="absolute h-4 w-4 text-gray-500/70" />
        </div>
      </div>
    </div>
  );
});
