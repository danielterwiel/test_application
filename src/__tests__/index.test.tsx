import { act, fireEvent, render, screen } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { describe, it, expect, vi } from "vitest";
import type { ChangeEvent } from "react";
import { ObservableQuery, type QueryResult } from "@apollo/client";
import * as apolloClient from "@apollo/client";

import App from "../pages/index";
import { GET_REACT_REPOSITORIES } from "../queries";

const mockNoResults = [
  {
    request: {
      query: GET_REACT_REPOSITORIES,
      variables: {
        query: "topic:react",
        before: undefined,
        after: null,
        first: 10,
        last: null,
      },
    },
    result: {
      data: {
        search: {
          edges: [],
          pageInfo: {
            endCursor: null,
            startCursor: null,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        },
      },
    },
  },
];

const mockError = [
  {
    request: {
      query: GET_REACT_REPOSITORIES,
      variables: {
        query: "topic:react",
        before: undefined,
        after: null,
        first: 10,
        last: null,
      },
    },
    error: new Error("An error occurred"),
  },
];

const mockResults = [
  {
    request: {
      query: GET_REACT_REPOSITORIES,
      variables: {
        query: "topic:react",
        before: undefined,
        after: null,
        first: 10,
        last: null,
      },
    },
    result: {
      data: {
        search: {
          edges: [
            {
              node: {
                id: 1,
                name: "React Repo 1",
                url: "http://example.com/repo1",
                stargazers: {
                  totalCount: 100,
                },
                forks: {
                  totalCount: 50,
                },
              },
            },
          ],
          pageInfo: {
            endCursor: null,
            startCursor: null,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        },
      },
    },
  },
];

describe("App component", () => {
  vi.mock("next/navigation", async () => {
    const actual = await vi.importActual("next/navigation");
    return {
      ...actual,
      useRouter: vi.fn(() => ({
        push: vi.fn(),
        replace: vi.fn(),
      })),
      useSearchParams: vi.fn(() => ({
        get: vi.fn(),
      })),
      usePathname: vi.fn(),
    };
  });

  vi.mock("../components/SearchInput.tsx", async () => {
    const actual = await vi.importActual("../components/SearchInput.tsx");
    return {
      ...actual,
      SearchInput: ({ onSearch }: { onSearch: (input: string) => string }) => (
        <input
          data-testid="search-input"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onSearch(event.target.value)
          }
        />
      ),
    };
  });

  vi.mock("../components/RepositoryTable.tsx", async () => {
    const actual = await vi.importActual("../components/RepositoryTable.tsx");
    const mock = vi.fn(() => {
      return <div>RepositoryTable</div>;
    });
    return {
      ...actual,
      RepositoryTable: mock,
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders loading state initially", () => {
    render(
      <MockedProvider mocks={mockNoResults} addTypename={false}>
        <App />
      </MockedProvider>,
    );

    expect(screen.getByText("Loading")).toBeInTheDocument();
  });

  it("renders error state", async () => {
    render(
      <MockedProvider mocks={mockError} addTypename={false}>
        <App />
      </MockedProvider>,
    );

    expect(
      await screen.findByText("Error: An error occurred"),
    ).toBeInTheDocument();
  });

  it(`renders "No results found" when there are no edges`, async () => {
    render(
      <MockedProvider mocks={mockNoResults} addTypename={false}>
        <App />
      </MockedProvider>,
    );

    expect(await screen.findByText("No results found")).toBeInTheDocument();
  });

  it("renders results", async () => {
    render(
      <MockedProvider mocks={mockResults} addTypename={false}>
        <App />
      </MockedProvider>,
    );

    expect(await screen.findByText("RepositoryTable")).toBeInTheDocument();
  });

  it("renders pagination buttons", async () => {
    render(
      <MockedProvider mocks={mockResults} addTypename={false}>
        <App />
      </MockedProvider>,
    );

    expect(await screen.findByText("Back")).toBeInTheDocument();
    expect(await screen.findByText("Next")).toBeInTheDocument();
  });

  it("renders title", async () => {
    render(
      <MockedProvider mocks={mockResults} addTypename={false}>
        <App />
      </MockedProvider>,
    );

    expect(await screen.findByText("Test Application")).toBeInTheDocument();
  });

  it("renders search input", async () => {
    render(
      <MockedProvider mocks={mockResults} addTypename={false}>
        <App />
      </MockedProvider>,
    );

    const mockSearchInput = screen.getByTestId("search-input");
    expect(mockSearchInput).toBeInTheDocument();
  });

  it("queries debounced search input", async () => {
    const fetchMoreMock = vi.fn(() => ({
      data: mockResults[0]?.result.data,
    }));
    vi.useFakeTimers();

    vi.spyOn(apolloClient, "useQuery").mockImplementation(() => ({
      fetchMore: fetchMoreMock,
      data: mockResults[0]?.result.data,
      loading: false,
      networkStatus: 0,
    }));

    act(() => {
      render(<App />);
    });

    expect(fetchMoreMock).not.toHaveBeenCalled();

    act(() => {
      vi.runAllTimers();
    });

    await act(async () => {
      fireEvent.change(screen.getByTestId("search-input"), {
        target: { value: "test" },
      });
    });

    expect(fetchMoreMock).toHaveBeenCalledWith({
      variables: {
        after: null,
        before: null,
        first: 10,
        last: null,
        query: "topic:react test",
      },
    });
  });
});
