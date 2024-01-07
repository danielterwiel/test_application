import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SearchInput } from "../components/SearchInput";

describe("SearchInput", () => {
  it("renders correctly", () => {
    render(
      <SearchInput onSearch={vi.fn()} loading={false} setLoading={vi.fn()} />,
    );
    expect(screen.getByRole("search")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
  });

  it("updates loading indicator on user input", async () => {
    const setLoadingMock = vi.fn();
    render(
      <SearchInput
        onSearch={vi.fn()}
        loading={false}
        setLoading={setLoadingMock}
      />,
    );

    fireEvent.change(screen.getByRole("search"), { target: { value: "test" } });
    expect(setLoadingMock).toHaveBeenCalledWith(true);
  });

  it("debounces search term", async () => {
    const onSearchMock = vi.fn();
    vi.useFakeTimers();

    render(
      <SearchInput
        onSearch={onSearchMock}
        loading={false}
        setLoading={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByRole("search"), { target: { value: "test" } });

    act(() => {
      vi.runAllTimers();
    });

    expect(onSearchMock).toHaveBeenCalledWith("test");
    vi.useRealTimers();
  });
});
