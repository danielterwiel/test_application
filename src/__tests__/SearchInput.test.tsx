import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SearchInput } from "../components/SearchInput";

describe("SearchInput", () => {
  vi.mock("next/navigation", async () => {
    const actual = await vi.importActual("next/navigation");
    return {
      ...actual,
      useSearchParams: vi.fn(() => ({
        get: vi.fn(),
      })),
    };
  });

  it("renders correctly", () => {
    render(<SearchInput onSearch={vi.fn()} />);
    expect(screen.getByRole("search")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
  });

  it("debounces search term", async () => {
    const onSearchMock = vi.fn();
    vi.useFakeTimers();

    render(<SearchInput onSearch={onSearchMock} />);
    fireEvent.change(screen.getByRole("search"), { target: { value: "test" } });

    act(() => {
      vi.runAllTimers();
    });

    expect(onSearchMock).toHaveBeenCalledWith("test");
    vi.useRealTimers();
  });
});
