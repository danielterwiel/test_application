import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RepositoryTable } from "../components/RepositoryTable";
import { type RepositoryEdge } from "../types";

const mockData: RepositoryEdge[] = [
  {
    node: {
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
];

describe("Table component", () => {
  it("renders repository data correctly", () => {
    render(<RepositoryTable data={mockData} />);

    const repoName = screen.getByText("React Repo 1");
    const repoStars = screen.getByText("100");
    const repoForks = screen.getByText("50");

    expect(repoName).toBeInTheDocument();
    expect(repoName.closest("a")).toHaveAttribute(
      "href",
      "http://example.com/repo1",
    );
    expect(repoStars).toBeInTheDocument();
    expect(repoForks).toBeInTheDocument();
  });
});
