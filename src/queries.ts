import { gql } from "@apollo/client";

export const GET_REACT_REPOSITORIES = gql`
  query GetReactRepositories {
    search(query: "topic:react", type: REPOSITORY, first: 10) {
      edges {
        node {
          ... on Repository {
            name
            stargazers {
              totalCount
            }
            forks {
              totalCount
            }
          }
        }
      }
    }
  }
`;
