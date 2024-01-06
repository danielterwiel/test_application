import { render, screen } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { describe, it, expect, vi } from "vitest";

import App from "../pages/index";

import { GET_REACT_REPOSITORIES } from "../queries";

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

  it("renders loading state initially", () => {
    const loadingMock = {
      request: {
        query: GET_REACT_REPOSITORIES,
        variables: {
          first: 10,
          before: null,
          query: "topic:react",
          last: null,
        },
      },
      result: {
        data: {
          search: {
            edges: [],
          },
        },
      },
    };

    render(
      <MockedProvider mocks={[loadingMock]} addTypename={false}>
        <App />
      </MockedProvider>,
    );
    expect(screen.getByText("Loading")).toBeInTheDocument();
  });

  it.skip("renders error state", async () => {
    const errorMock = [
      {
        request: {
          query: GET_REACT_REPOSITORIES,
          variables: {
            first: 10,
            before: null,
            query: "topic:react",
            last: null,
          },
        },
        error: new Error("An error occurred"),
      },
    ];

    render(
      <MockedProvider mocks={errorMock} addTypename={false}>
        <App />
      </MockedProvider>,
    );

    expect(await screen.findByText("Error:")).toBeInTheDocument();
  });

  it.skip(`renders "No results found" when there are no edges`, async () => {
    const noDataMock = {
      request: {
        query: GET_REACT_REPOSITORIES,
        variables: {
          first: 10,
          before: null,
          query: "topic:react",
          last: null,
        },
      },
      result: {
        data: {
          search: {
            edges: [],
          },
        },
      },
    };

    render(
      <MockedProvider mocks={[noDataMock]} addTypename={false}>
        <App />
      </MockedProvider>,
    );

    expect(await screen.findByText("No results found")).toBeInTheDocument();
  });
});
