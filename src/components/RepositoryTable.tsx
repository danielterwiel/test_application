import React from "react";
import { type RepositoryEdge } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import clsx from "clsx";

export const RepositoryTable = ({
  data,
  loading,
}: {
  data: RepositoryEdge[] | undefined;
  loading: boolean;
}) => {
  const tableClass = clsx({
    "animate-pulse": loading,
    "font-mono": true,
  });
  return (
    <Table className={tableClass}>
      <TableCaption>A list of popular React repositories.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>
            <span className="flex justify-end gap-1">
              <span aria-hidden="true">🌟</span>
              Stars
            </span>
          </TableHead>
          <TableHead>
            <span className="flex justify-end gap-1">
              <span aria-hidden="true">🍴</span>
              Forks
            </span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((edge: RepositoryEdge) => (
          <TableRow key={edge.node.name}>
            <TableCell>
              <a href={edge.node.url} target="_blank" rel="noopener noreferrer">
                {edge.node.name}
              </a>
            </TableCell>
            <TableCell>
              <span className="flex justify-end gap-1">
                <span aria-hidden="true">🌟</span>
                {edge.node.stargazers.totalCount}
              </span>
            </TableCell>
            <TableCell>
              <span className="flex justify-end gap-1">
                <span aria-hidden="true">🍴</span>
                {edge.node.forks.totalCount}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
