"use client";

import React from "react";
import Pagination from "@/components/common/Pagination";
import { TableBody } from "../ui/table";

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  search?: string;
  onSearchChange?: (value: string) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onAdd?: () => void;
  addLabel?: string;
  emptyMessage?: string;
}

export default function Table<T>({
  columns,
  data,
  loading,
  search,
  onSearchChange,
  page = 1,
  totalPages = 1,
  onPageChange,
  onAdd,
  addLabel = "Add",
  emptyMessage = "No records found.",
}: TableProps<T>) {
  return (
    <div>
      {/*Search + Add Button */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
        <input
          type="text"
          placeholder="Search..."
          value={search || ""}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full max-w-sm rounded-xl border px-4 py-2 text-gray-900 dark:text-white"
        />
        {onAdd && (
          <button 
            onClick={onAdd} variant="success"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            {addLabel}
          </button>
        )}
      </div>

  {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-6 text-md">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-6">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={i}
                  className="px-5 py-3 text-gray-900 dark:text-white text-md"
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-2">
                      {col.render ? col.render(row) : String((row as any)[col.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </TableBody>
        </table>
      </div>

      {console.log("Pagination debug:", page, totalPages)}

      {/* Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Page {page} of {totalPages}
        </span>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={onPageChange || (() => {})}
        />
      </div>
    </div>
  );
}
