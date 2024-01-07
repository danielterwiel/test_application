import React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

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
  initialValue = "",
}: {
  onSearch: (searchTerm: string) => void;
  initialValue: string;
}) {
  const initialRender = React.useRef(true);
  const [searchTerm, setSearchTerm] = React.useState<string>(initialValue);
  const debouncedSearchTerm = useDebouncedSearchTerm(searchTerm, 250);

  React.useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
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
          placeholder="e.g. @tanstack/table"
          className="pl-8 focus:ring-2 focus:ring-offset-2 focus:ring-offset-border"
        />
        <div className="absolute pl-2 pt-2.5">
          <MagnifyingGlassIcon className="absolute h-4 w-4" />
        </div>
      </div>
    </div>
  );
});
