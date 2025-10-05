"use client";

import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import Pagination from "../../components/tables/Pagination";
import Label from "../form/Label";
import Input from "../form/input/InputField";

interface Tenant {
  _id: string;
  tenantId: string;
  fullName: string;
  callingName: string;
  nicNo: string;
  contactNo: string;
  address: string;
  joinedDate: string;
  role?: string;
  image?: string;
  isActive?: boolean | null;
}

const TenantList: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"enable" | "disable">("disable");

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/tenants?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`
      );
      const data = await res.json();

      // Ensure each tenant has a valid _id
      const decryptedTenants = (data.data || []).map((t: any) => ({
        ...t,
        _id: t._id || t.tenantId || crypto.randomUUID(),
      }));

      setTenants(decryptedTenants);
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
    setPage(1);
  };

  const handleActionClick = (tenant: Tenant, action: "enable" | "disable") => {
    if (!tenant._id) {
      console.error("Tenant missing _id:", tenant);
      return;
    }
    setSelectedTenant(tenant);
    setActionType(action);
    setIsActionModalOpen(true);
  };

  const handlePerformAction = async () => {
    if (!selectedTenant?._id) return;
    try {
      const res = await fetch(`/api/tenants?id=${selectedTenant._id}&action=${actionType}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to update tenant");
      setIsActionModalOpen(false);
      setSelectedTenant(null);
      fetchTenants();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (tenant: Tenant) => {
    if (!tenant._id) {
      console.error("Tenant missing _id:", tenant);
      return;
    }
    setSelectedTenant(tenant);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (updatedTenant: Partial<Tenant>) => {
  if (!selectedTenant?._id) return;

  const editableTenant = {
    fullName: updatedTenant.fullName,
    callingName: updatedTenant.callingName,
    nicNo: updatedTenant.nicNo,
    contactNo: updatedTenant.contactNo,
    address: updatedTenant.address,
  };

  try {
    const res = await fetch(`/api/tenants?id=${selectedTenant._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editableTenant),
    });
    if (!res.ok) throw new Error("Failed to edit tenant");
    setIsEditModalOpen(false);
    setSelectedTenant(null);
    fetchTenants();
  } catch (err) {
    console.error(err);
  }
};


  return (
    <div className="space-y-4">
      {/* Top controls */}
      <div className="flex items-center justify-between">
      <input
        type="text"
        placeholder="Search by Name, NIC, or Contact"
        value={search}
        onChange={handleSearchChange}
        className="w-full max-w-sm rounded border px-4 py-2 text-gray-900 dark:text-white"
      />
      {/* <Button onClick={() => setIsAddModalOpen(true)}>+ Add Building</Button> */}
    </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[900px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {["Tenant ID", "Name", "NIC", "Contact", "Address", "Joined Date", "Status", "Actions"].map(
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
                  <TableRow key="loading">
                    <TableCell colSpan={7} className="text-center py-4 text-gray-900 dark:text-white">>
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : tenants.length > 0 ? (
                  tenants.map((tenant) => (
                    <TableRow key={tenant._id}>
                      <TableCell className="px-5 py-3 text-gray-900 dark:text-white">{tenant.tenantId}</TableCell>
                      <TableCell className="px-5 py-3 text-gray-900 dark:text-white">{tenant.fullName}</TableCell>
                      <TableCell className="px-5 py-3 text-gray-900 dark:text-white">{tenant.nicNo}</TableCell>
                      <TableCell className="px-5 py-3 text-gray-900 dark:text-white">{tenant.contactNo}</TableCell>
                      <TableCell className="px-5 py-3 text-gray-900 dark:text-white">{tenant.address}</TableCell>
                      <TableCell className="px-5 py-3 text-gray-900 dark:text-white">{new Date(tenant.joinedDate).toLocaleDateString()}</TableCell>
                      <TableCell className="px-4 py-3 ">
                        <Badge
                          color={
                            tenant.isActive === true
                              ? "success"
                              : tenant.isActive === false
                              ? "warning"
                              : "error"
                          }
                        >
                          {tenant.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEditClick(tenant)}
                          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
                        >
                          <svg
                            className="fill-current"
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                              fill=""
                            />
                          </svg>
                          Edit
                        </button>
                       {/* Enable/Disable Button */}
                        <button
                          onClick={() =>
                            tenant.isActive
                              ? handleActionClick(tenant, "disable")
                              : handleActionClick(tenant, "enable")
                          }
                          className={`flex w-full items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-medium shadow-theme-xs lg:inline-flex lg:w-auto ${
                            tenant.isActive
                              ? "border-gray-300 text-red-500 hover:bg-red-50 hover:text-red-600 dark:border-gray-700 dark:text-red-400 dark:hover:bg-white/[0.03] dark:hover:text-red-300"
                              : "border-gray-300 text-green-500 hover:bg-green-50 hover:text-green-600 dark:border-gray-700 dark:text-green-400 dark:hover:bg-white/[0.03] dark:hover:text-green-300"
                          }`}
                        >
                          {tenant.isActive ? "Disable" : "Enable"}
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow key="no-data">
                    <TableCell colSpan={7} className="text-center py-4">
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

      {/* Enable/Disable Modal */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => {
          setIsActionModalOpen(false);
          setSelectedTenant(null);
        }}
        className="max-w-[600px] m-4"
      >
        <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {actionType === "disable" ? "Disable Tenant" : "Enable Tenant"}
          </h3>
          <p className="mb-6 text-gray-900 dark:text-white">
            Are you sure you want to {actionType}{" "}
            <span className="font-bold">{selectedTenant?.fullName}</span>?
          </p>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsActionModalOpen(false)}
              className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              Cancel
            </Button>
            <Button variant={actionType === "disable" ? "destructive" : "success"} onClick={handlePerformAction}
              className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              {actionType === "disable" ? "Disable" : "Enable"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      {selectedTenant && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTenant(null);
          }}
          className="max-w-[600px] m-4"
        >
          <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Edit Tenant</h3>
            <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                type="text"
                placeholder="Full Name"
                defaultValue={selectedTenant?.fullName || ""}
                onChange={(e) =>
                  setSelectedTenant({ ...selectedTenant, fullName: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Calling Name</Label>
              <Input
                type="text"
                defaultValue={selectedTenant?.callingName || ""}
                onChange={(e) =>
                  setSelectedTenant( { ...selectedTenant, callingName: e.target.value })
                }
              />
            </div>
            <div>
              <Label>NIC</Label>
              <Input
                type="text"
                defaultValue={selectedTenant?.nicNo || ""}
                onChange={(e) =>
                  setSelectedTenant({ ...selectedTenant, nicNo: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Contact Number</Label>
              <Input
                type="text"
                defaultValue={selectedTenant?.contactNo || ""}
                onChange={(e) =>
                  setSelectedTenant({ ...selectedTenant, contactNo: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input
                type="text"
                defaultValue={selectedTenant?.address || ""}
                onChange={(e) =>
                  setSelectedTenant({ ...selectedTenant, address: e.target.value })
                }
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => selectedTenant && handleEditSubmit(selectedTenant)}>
                Save
              </Button>
            </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TenantList;
