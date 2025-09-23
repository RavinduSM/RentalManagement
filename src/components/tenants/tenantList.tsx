"use client";

import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import Pagination from "../../components/tables/Pagination"; // Import your pagination component

interface Tenant {
  id: string;
  fullName: string;
  callingName: string;
  nicNo: string;
  contactNo: string;
  address: string;
  joinedDate: string;
  role?: string;
  image?: string;
  status?: "Active" | "Pending" | "Cancel";
}

const TenantList: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/tenants?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`
      );
      const data = await res.json();
      setTenants(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch tenants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [page, search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };

  return (
    <div className="space-y-4">
      {/* Search input */}
      <input
        type="text"
        placeholder="Search by Name, NIC, or Contact"
        value={search}
        onChange={handleSearchChange}
        className="w-full max-w-sm rounded border px-4 py-2"
      />

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {["Name", "NIC", "Contact", "Address", "Joined Date", "Status"].map(
                    (header) => (
                      <TableCell
                        key={header}
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        {header}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <TableRow>
                    <TableCell className="text-center py-4" >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : tenants.length > 0 ? (
                  tenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div className="flex items-center gap-3">
                          {tenant.image && (
                            <div className="w-10 h-10 overflow-hidden rounded-full">
                              <Image
                                width={40}
                                height={40}
                                src={tenant.image}
                                alt={tenant.fullName}
                              />
                            </div>
                          )}
                          <div>
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {tenant.fullName}
                            </span>
                            {tenant.role && (
                              <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                {tenant.role}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {tenant.nicNo}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {tenant.contactNo}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {tenant.address}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {new Date(tenant.joinedDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <Badge
                          size="sm"
                          color={
                            tenant.status === "Active"
                              ? "success"
                              : tenant.status === "Pending"
                              ? "warning"
                              : "error"
                          }
                        >
                          {tenant.status || "Unknown"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="text-center py-4" >
                      No tenants found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default TenantList;
