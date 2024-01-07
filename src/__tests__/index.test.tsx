import { render, screen, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { describe, it, expect, vi } from "vitest";

import App from "../pages/index";
import { GET_REACT_REPOSITORIES } from "../queries";
import { type RepositoryEdge } from "../types";

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
      SearchInput: vi.fn(),
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
});
