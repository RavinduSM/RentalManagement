"use client";

import React, { useEffect, useState } from "react";
import DataTable from "@/components/common/Table";
import AddModal from "@/components/common/AddModal";
import EditModal from "@/components/common/EditModal";
import DeleteModal from "@/components/common/DeleteModal";
import Badge from "@/components/ui/badge/Badge";
import TableActionButtons from "../form/form-elements/TableActionButtons";

interface Meter {
  _id: string;
  mainMeterId: string;
  meterType: string;
  meterNo: string;    
  buildingId: string | { _id: string; name: string; buildingId: string };
  installedAt: Date;
  isActive: boolean;  
}

export default function TenantPage() {
  const [meters, setMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [buildings, setBuildings] = useState<any[]>([]);

  const [formData, setFormData] = useState<Partial<Meter>>({});
  const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const fetchMeters = async () => {
    setLoading(true);
    try {
      const pageSize = 10; // or make this configurable later
      const res = await fetch(`/api/meter/mainMeter?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`);

      if (!res.ok) {
        const text = await res.text(); // show what the server returned
        console.error("API ERROR:", res.status, text);
        throw new Error("Failed to fetch meter data");
      }

      const data = await res.json();
      setMeters(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeters();
  }, [page, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const fetchBuildings = async () => {
  const res = await fetch("/api/building"); 
  const data = await res.json();
  setBuildings(data.buildings || []);
};

console.log("buildings", buildings)

  useEffect(() => {
    fetchBuildings();
  }, []);

  const handleAdd = async () => {
    await fetch("/api/meter/mainMeter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setIsAddOpen(false);
    setFormData({});
    fetchMeters();
  };

  const handleEdit = async () => {
    if (!selectedMeter?._id) return;
    await fetch(`/api/meter/mainMeter?id=${selectedMeter._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setIsEditOpen(false);
    setSelectedMeter(null);
    setFormData({});
    fetchMeters();
  };

  const handleDelete = async () => {
    if (!selectedMeter?._id) return;
    await fetch(`/api/meter/mainMeter?id=${selectedMeter._id}`, { method: "DELETE" });
    setIsDeleteOpen(false);
    setSelectedMeter(null);
    fetchMeters();
  };

  const openEditModal = (meter: Meter) => {
  setSelectedMeter(meter);

  setFormData({
    ...meter,
    buildingId:
      typeof meter.buildingId === "object"
        ? meter.buildingId._id  
        : meter.buildingId,
  });

  setIsEditOpen(true);
};

  const columns = [
    { key: "mainMeterId", label: "Main Meter ID" },
    { key: "meterType", label: "Meter Type" },
    { key: "meterNo", label: "Meter No" },
    { key: "buildingCustomId", label: "Building ID" },
    {
      key: "installedAt",
      label: "Installed At",
      render: (m: Meter) => new Date(m.installedAt).toLocaleDateString(),
    },
    {
      key: "isActive",
      label: "Status",
      render: (m: Meter) => (
        <Badge color={m.isActive ? "success" : "warning"}>
          {m.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (m: Meter) => (
        <TableActionButtons
          onEdit={() => openEditModal(m)}
          onDelete={() => {
            setSelectedMeter(m);
            setIsDeleteOpen(true);
          }}
          showToggle={false}
        />
      ),
    },
  ];


  const fields = [
    { key: "mainMeterId", label: "Main Meter ID", required: true },
    {
      key: "meterType",
      label: "Meter Type",
      type: "select",
      options: [
        {
          value: "Electricity",
          label: "Electricity",
        },
        {
          value: "Water",
          label: "Water",
        },
      ],
    },
    { key: "meterNo", label: "Meter Number" },
    {
      key: "buildingId",
      label: "Building",
      type: "select",
      options: buildings.map((b) => ({
        value: b._id,
        label: `${b.buildingId} - ${b.name}`,
      })),
    },

    { key: "installedAt", label: "Installed At", type: "date" },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={meters}
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
        addLabel="+ Add Meter"
      />

      <AddModal<Meter>
        isOpen={isAddOpen}
        title="Add Meter"
        entityName="Meter"
        fields={fields}
        data={formData}
        onChange={setFormData}
        onSubmit={handleAdd}
        onClose={() => setIsAddOpen(false)}
      />

      <EditModal<Meter>
        isOpen={isEditOpen}
        title="Edit Meter"
        entityName="Meter"
        fields={fields}
        data={formData}
        onChange={setFormData}
        onSubmit={handleEdit}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedMeter(null);
          setFormData({});
        }}
      />

      <DeleteModal
        isOpen={isDeleteOpen}
        entityName="Tenant"
        onConfirm={handleDelete}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedMeter(null);
        }}
      />
    </>
  );
}
