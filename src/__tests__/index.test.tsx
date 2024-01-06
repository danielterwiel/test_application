import { MockedProvider } from "@apollo/client/testing";
import { render, screen, waitFor } from "@testing-library/react";

import App from "../pages/index";

import { GET_REACT_REPOSITORIES } from "../queries";
import { describe, it, expect, vi } from "vitest";

const mocks = [
  {
    request: {
      query: GET_REACT_REPOSITORIES,
      variables: {
        after: null,
        before: null,
        first: 10,
        last: undefined,
      },
    },
    result: {
      data: {
        search: {
          edges: [
            // ...mock your data here
          ],
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
      <MockedProvider mocks={[]} addTypename={false}>
        <App />
      </MockedProvider>,
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
