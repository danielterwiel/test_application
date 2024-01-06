import React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "~/@/components/ui/label";
import { MagnifyingGlassIcon, ReloadIcon } from "@radix-ui/react-icons";

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

export const DebouncedSearchInput = React.memo(function DebouncedSearchInput({
  onSearch,
  loading,
  setLoading,
}: {
  onSearch: (searchTerm: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}) {
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const debouncedSearchTerm = useDebouncedSearchTerm(searchTerm, 250);

  React.useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
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
          placeholder="e.g. @tanstack/react-table"
          className="pl-8"
        />
        <div className="absolute pl-2 pt-2.5">
          {loading ? (
            <ReloadIcon className="absolute h-4 w-4 animate-spin" />
          ) : (
            <MagnifyingGlassIcon className="absolute h-4 w-4" />
          )}
        </div>
      </div>
    </div>
  );
});
