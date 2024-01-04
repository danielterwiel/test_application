import React from "react";
import { type RepositoryEdge } from "../types";

export const Table = ({ data }: { data: RepositoryEdge[] }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>
            <span className="flex justify-end gap-1">
              <span aria-hidden="true">🌟</span>
              Stars
            </span>
          </th>
          <th>
            <span className="flex justify-end gap-1">
              <span aria-hidden="true">🍴</span>
              Forks
            </span>
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
              <span className="flex justify-end gap-1">
                <span aria-hidden="true">🌟</span>
                {edge.node.stargazers.totalCount}
              </span>
            </td>
            <td>
              <span className="flex justify-end gap-1">
                <span aria-hidden="true">🍴</span>
                {edge.node.forks.totalCount}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
