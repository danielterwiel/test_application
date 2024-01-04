import { MockedProvider } from "@apollo/client/testing";
import { render, screen, waitFor } from "@testing-library/react";

import App from "../pages/index";

import { GET_REACT_REPOSITORIES } from "../queries";
import { describe, it, expect } from "vitest";

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

describe("Home Component", () => {
  it("renders without error", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <App />
      </MockedProvider>,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      expect(screen.getByText("Test Application")).toBeInTheDocument();
      // Add more assertions as needed
    });
  });

  it("handles the next pagination", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <App />
      </MockedProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Next")).toBeInTheDocument();
      // Mock and simulate click event on 'Next' button
      // Assert changes after pagination
    });
  });

  it("renders loading state initially", () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <App />
      </MockedProvider>,
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders error state", async () => {
    const errorMock = {
      request: {
        query: GET_REACT_REPOSITORIES,
      },
      error: new Error("An error occurred"),
    };

    render(
      <MockedProvider mocks={[errorMock]} addTypename={false}>
        <App />
      </MockedProvider>,
    );

    expect(await screen.findByText("Error")).toBeInTheDocument();
  });

  it("renders no data found when there are no edges", async () => {
    const noDataMock = {
      request: {
        query: GET_REACT_REPOSITORIES,
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

    expect(await screen.findByText("No data found")).toBeInTheDocument();
  });
});
