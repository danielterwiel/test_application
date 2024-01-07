import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SearchInput } from "../components/SearchInput";

describe("SearchInput", () => {
  it("renders correctly", () => {
    render(<SearchInput onSearch={vi.fn()} initialValue="" />);
    expect(screen.getByRole("search")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
  });

  it("sets initial value", () => {
    render(<SearchInput onSearch={vi.fn()} initialValue="test" />);
    expect(screen.getByRole("search")).toHaveValue("test");
  });

  it("debounces search term", async () => {
    const onSearchMock = vi.fn();
    vi.useFakeTimers();

    render(<SearchInput onSearch={onSearchMock} initialValue="" />);
    fireEvent.change(screen.getByRole("search"), { target: { value: "test" } });

    act(() => {
      vi.runAllTimers();
    });

    expect(onSearchMock).toHaveBeenCalledWith("test");
    vi.useRealTimers();
  });
});
