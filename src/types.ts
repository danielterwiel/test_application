export interface Repository {
  name: string;
  url: string;
  stargazers: {
    totalCount: number;
  };
  forks: {
    totalCount: number;
  };
}

export interface RepositoryEdge {
  node: Repository;
}

export interface SearchResults {
  search: {
    edges: RepositoryEdge[];
  };
}
