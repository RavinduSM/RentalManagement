"use client";

import React from "react";
import Button from "../ui/button/Button";
import Pagination from "@/components/common/Pagination";

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
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
      {/* 🔍 Search + Add Button */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
        <input
          type="text"
          placeholder="Search..."
          value={search || ""}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 w-full md:w-64"
        />
        {onAdd && (
          <Button onClick={onAdd} variant="success">
            {addLabel}
          </Button>
        )}
      </div>

      {/* 🧾 Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="text-left px-4 py-2 font-semibold text-gray-700 dark:text-gray-300"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-6">
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
                  className={i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-2">
                      {col.render ? col.render(row) : String((row as any)[col.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {console.log("Pagination debug:", page, totalPages)}

      {/* 📄 Pagination */}
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
