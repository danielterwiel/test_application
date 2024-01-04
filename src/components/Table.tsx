import React from "react";
import { type RepositoryEdge } from "../types";

export const Table = ({ data }: { data: RepositoryEdge[] }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>
            <span aria-hidden="true">🌟</span>
            Stars
          </th>
          <th>
            <span aria-hidden="true">🍴</span>
            Forks
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((edge: RepositoryEdge) => (
          <tr key={edge.node.name}>
            <td>
              <a href={edge.node.url} target="_blank" rel="noopener noreferrer">
                {edge.node.name}
              </a>
            </td>
            <td>
              <span aria-hidden="true">🌟</span>
              {edge.node.stargazers.totalCount}
            </td>
            <td>
              <span aria-hidden="true">🍴</span>
              {edge.node.forks.totalCount}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
