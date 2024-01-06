import React from "react";

import { Input } from "@/components/ui/input";

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

export const DebouncedSearchInput = React.memo(
  ({ onSearch }: { onSearch: (searchTerm: string) => void }) => {
    const [searchTerm, setSearchTerm] = React.useState<string>("");
    const debouncedSearchTerm = useDebouncedSearchTerm(searchTerm, 1000);

    React.useEffect(() => {
      onSearch(debouncedSearchTerm);
    }, [debouncedSearchTerm, onSearch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    };

    return (
      <form onSubmit={(e) => e.preventDefault()}>
        <Input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          placeholder="e.g. @tanstack/table" // NOTE: should be @tanstack/react-table
        />
      </form>
    );
  },
);
