import { gql } from "@apollo/client";

export const GET_REACT_REPOSITORIES = gql`
  query GetReactRepositories(
    $query: String!
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    search(
      query: $query
      type: REPOSITORY
      first: $first
      after: $after
      last: $last
      before: $before
    ) {
      edges {
        node {
          ... on Repository {
            name
            url
            description
            stargazers {
              totalCount
            }
            forks {
              totalCount
            }
          }
        }
      }
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;
