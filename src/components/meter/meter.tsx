"use client";

import React, { useEffect, useState } from "react";
import DataTable from "@/components/common/Table";
import AddModal from "@/components/common/AddModal";
import EditModal from "@/components/common/EditModal";
import DeleteModal from "@/components/common/DeleteModal";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import TableActionButtons from "../form/form-elements/TableActionButtons";

interface Tenant {
  _id: string;
  tenantId: string;
  fullName: string;
  callingName: string;
  nicNo: string;
  contactNo: string;
  address: string;
  joinedDate: string;
  isActive?: boolean;
}

export default function TenantPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState<Partial<Tenant>>({});
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const pageSize = 10; // or make this configurable later
      const res = await fetch(`/api/tenants?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setTenants(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [page, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleAdd = async () => {
    await fetch("/api/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setIsAddOpen(false);
    setFormData({});
    fetchTenants();
  };

  const handleEdit = async () => {
    if (!selectedTenant?._id) return;
    await fetch(`/api/tenants?id=${selectedTenant._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setIsEditOpen(false);
    setSelectedTenant(null);
    setFormData({});
    fetchTenants();
  };

  const handleDelete = async () => {
    if (!selectedTenant?._id) return;
    await fetch(`/api/tenants?id=${selectedTenant._id}`, { method: "DELETE" });
    setIsDeleteOpen(false);
    setSelectedTenant(null);
    fetchTenants();
  };

  const openEditModal = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setFormData({ ...tenant });
    setIsEditOpen(true);
  };

  const columns = [
    { key: "tenantId", label: "Tenant ID" },
    { key: "fullName", label: "Full Name" },
    { key: "nicNo", label: "NIC" },
    { key: "contactNo", label: "Contact" },
    { key: "address", label: "Address" },
    {
      key: "joinedDate",
      label: "Joined Date",
      render: (t: Tenant) => new Date(t.joinedDate).toLocaleDateString(),
    },
    {
      key: "isActive",
      label: "Status",
      render: (t: Tenant) => (
        <Badge color={t.isActive ? "success" : "warning"}>
          {t.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (t: Tenant) => (
        <TableActionButtons
          onEdit={() => openEditModal(t)}
          onDelete={() => {
            setSelectedTenant(t);
            setIsDeleteOpen(true);
          }}
          showToggle={false} // disable toggle for now
        />
      ),
    },
  ];

  const fields = [
    { key: "fullName", label: "Full Name", required: true },
    { key: "callingName", label: "Calling Name" },
    { key: "nicNo", label: "NIC No" },
    { key: "contactNo", label: "Contact No" },
    { key: "address", label: "Address" },
    { key: "joinedDate", label: "Joined Date", type: "date" },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={tenants}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onAdd={() => {
          setFormData({});
          setIsAddOpen(true);
        }}
        addLabel="Add Tenant"
      />


      <AddModal<Tenant>
        isOpen={isAddOpen}
        title="Add Tenant"
        entityName="Tenant"
        fields={fields}
        data={formData}
        onChange={setFormData}
        onSubmit={handleAdd}
        onClose={() => setIsAddOpen(false)}
      />

      <EditModal<Tenant>
        isOpen={isEditOpen}
        title="Edit Tenant"
        entityName="Tenant"
        fields={fields}
        data={formData}
        onChange={setFormData}
        onSubmit={handleEdit}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedTenant(null);
          setFormData({});
        }}
      />

      <DeleteModal
        isOpen={isDeleteOpen}
        entityName="Tenant"
        onConfirm={handleDelete}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedTenant(null);
        }}
      />
    </>
  );
}
