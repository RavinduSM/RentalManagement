"use client";

import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

interface Building {
  buildingId: string;
  name: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

const BuildingList: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

  // Add modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBuilding, setNewBuilding] = useState({ name: "", location: "" });

  const fetchBuildings = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/building?page=${page}&limit=${pageSize}&name=${encodeURIComponent(search)}`
      );
      const data = await res.json();
      setBuildings(data.buildings || []); // data from API
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching buildings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, [page, search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // ===== HIGHLIGHTED: Handle save after editing =====
  const handleSave = () => {
    if (selectedBuilding) {
      // Here you would call your API to update the building
      console.log("Saving building:", selectedBuilding);

      // Update local table state
      setBuildings((prev) =>
        prev.map((b) => (b.buildingId === selectedBuilding.buildingId ? selectedBuilding : b))
      );

      // Close modal
      setIsModalOpen(false);
    }
  };

  const handleAddBuilding = async () => {
    try {
      const res = await fetch(`/api/building`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBuilding),
      });

      if (!res.ok) throw new Error("Failed to add building");

      const created = await res.json();

      setBuildings((prev) => [created, ...prev]); // add new to list
      setIsAddModalOpen(false);
      setNewBuilding({ name: "", location: "" });
    } catch (err) {
      console.error("Error adding building:", err);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top controls */}
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Search by Building Name or ID"
          value={search}
          onChange={handleSearchChange}
          className="w-full max-w-sm rounded border px-4 py-2 text-gray-900 dark:text-white"
        />
        <Button onClick={() => setIsAddModalOpen(true)}>+ Add Building</Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[900px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {["Building ID", "Name", "Location", "Created At", "Updated At", "Actions"].map(
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
                    <TableCell className="text-center py-4">Loading...</TableCell>
                  </TableRow>
                ) : buildings.length > 0 ? (
                  buildings.map((b) => (
                    <TableRow key={b.buildingId}>
                      <TableCell className="px-5 py-3 text-start text-gray-900 dark:text-white">{b.buildingId}</TableCell>
                      <TableCell className="px-4 py-3 text-start text-gray-900 dark:text-white">{b.name}</TableCell>
                      <TableCell className="px-4 py-3 text-start text-gray-900 dark:text-white">{b.location}</TableCell>
                      <TableCell className="px-4 py-3 text-start text-gray-900 dark:text-white">
                        {new Date(b.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-gray-900 dark:text-white">
                        {new Date(b.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-gray-900 dark:text-white">
                        <button
                          onClick={() => {
                            console.log("Selected building:", b);
                            setSelectedBuilding(b);
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                        >
                          Edit
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="text-center py-4">No buildings found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center space-x-2">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50 text-gray-900 dark:text-white"
        >
          Previous
        </button>
        <span  className = "text-gray-900 dark:text-white">
          Page {page} of {totalPages}         
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50 text-gray-900 dark:text-white"
        >
          Next
        </button>
      </div>

      {selectedBuilding && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          className="max-w-[600px] m-4"
        >
          <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl">
            <h3 className="text-xl font-semibold mb-4 dark:text-white">Edit Building</h3>
            <div className="space-y-4">
              <div>
                <Label>Building ID</Label>
               <Input
                type="text"
                defaultValue={selectedBuilding.buildingId || ""} 
                disabled
              />
              </div>
              <div>
                <Label>Name</Label>
                <Input
                  type="text"
                  defaultValue={selectedBuilding.name} 
                  onChange={(e) =>
                    setSelectedBuilding({ ...selectedBuilding, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  type="text"
                  defaultValue={selectedBuilding.location} 
                  onChange={(e) =>
                    setSelectedBuilding({ ...selectedBuilding, location: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        className="max-w-[600px] m-4"
      >
        <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl">
          <h3 className="text-xl font-semibold mb-4">Add New Building</h3>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                type="text"
                value={newBuilding.name}
                onChange={(e) => setNewBuilding({ ...newBuilding, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                type="text"
                value={newBuilding.location}
                onChange={(e) => setNewBuilding({ ...newBuilding, location: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBuilding}>Add Building</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default BuildingList;
