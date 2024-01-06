export interface Repository {
  id: number;
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

export interface PageInfo {
  startCursor: string;
  endCursor: string;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface SearchResults {
  search: {
    edges: RepositoryEdge[];
    pageInfo: PageInfo;
  };
}
