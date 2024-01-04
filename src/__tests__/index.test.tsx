import { render, screen } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";

import App from "../pages/index";

import { GET_REACT_REPOSITORIES } from "../queries";
import { describe, it, expect } from "vitest";

describe("App component", () => {
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
