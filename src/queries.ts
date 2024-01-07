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
      last: $last
      before: $before
      after: $after
    ) {
      edges {
        node {
          ... on Repository {
            id
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
