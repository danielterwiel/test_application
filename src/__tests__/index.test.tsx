import { MockedProvider } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";

import App from "../pages/index";

import { GET_REACT_REPOSITORIES } from "../queries";
import { describe, it, expect, vi } from "vitest";

const mockEdge = {
  __typename: "SearchResultItemEdge",
  node: {
    __typename: "Repository",
    id: "MDEwOlJlcG9zaXRvcnkyODQ1NzgyMw==",
    name: "freeCodeCamp",
    url: "https://github.com/freeCodeCamp/freeCodeCamp",
    description:
      "freeCodeCamp.org's open-source codebase and curriculum. Learn to code for free.",
    stargazers: {
      __typename: "StargazerConnection",
      totalCount: 380973,
    },
    forks: {
      __typename: "RepositoryConnection",
      totalCount: 33484,
    },
  },
};
const mocks = [
  {
    request: {
      query: GET_REACT_REPOSITORIES,
      variables: {
        query: "topic:react",
        first: 10,
        before: null,
        last: null,
      },
    },
    result: {
      data: {
        search: {
          edges: [mockEdge],
          pageInfo: {
            endCursor: "cursor",
            startCursor: "cursor",
            hasNextPage: true,
            hasPreviousPage: false,
          },
        },
      },
    },
  },
];

describe("App Component", () => {
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

  it("renders loading state initially", () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <App />
      </MockedProvider>,
    );
    expect(screen.getByText("Loading")).toBeInTheDocument();
  });
});
