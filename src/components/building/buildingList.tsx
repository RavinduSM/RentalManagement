"use client";

import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Pagination from "../tables/Pagination";

interface Building {
  _id: string;
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
  const pageSize = 5;
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBuilding, setNewBuilding] = useState({ name: "", location: "" });

  // Fetch buildings from backend
  const fetchBuildings = async () => {
    setLoading(true);
    try {
      const query = [`page=${page}`, `limit=${pageSize}`];
      if (search.trim() !== "") {
        query.push(`name=${encodeURIComponent(search)}`);
      }
      const res = await fetch(
        `/api/building?${query.join("&")}`
      );
      const data = await res.json();
      setBuildings(data.buildings || []);
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

  // Search handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // Add building
  const handleAddBuilding = async () => {
    try {
      const res = await fetch(`/api/building`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBuilding),
      });
      if (!res.ok) throw new Error("Failed to add building");

      fetchBuildings(); // re-fetch after adding
      setIsAddModalOpen(false);
      setNewBuilding({ name: "", location: "" });
    } catch (err) {
      console.error("Error adding building:", err);
    }
  };

  // Edit building
  const handleSave = async () => {
    if (!selectedBuilding) return;

    try {
      const res = await fetch(`/api/building?id=${selectedBuilding._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedBuilding.name,
          location: selectedBuilding.location,
        }),
      });
      if (!res.ok) throw new Error("Failed to update building");

      fetchBuildings(); // re-fetch after update
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error updating building:", err);
    }
  };

  // Delete building (soft delete) with custom modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [buildingToDelete, setBuildingToDelete] = useState<Building | null>(null);

  const handleDeleteClick = (building: Building) => {
    setBuildingToDelete(building);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!buildingToDelete) return;

    try {
      const res = await fetch(`/api/building?id=${buildingToDelete._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete building");

      fetchBuildings(); // re-fetch after delete
      setDeleteConfirmOpen(false);
      setBuildingToDelete(null);
    } catch (err) {
      console.error("Error deleting building:", err);
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
                  {["Building ID", "Name", "Location", "Actions"].map(
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
                    <TableCell className="text-center py-4 text-gray-900 dark:text-white">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : buildings.length > 0 ? (
                  buildings.map((b) => (
                    <TableRow key={b._id}>
                      <TableCell className="px-5 py-3 text-gray-900 dark:text-white">{b.buildingId}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-900 dark:text-white">{b.name}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-900 dark:text-white">{b.location}</TableCell>
                      <TableCell className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedBuilding(b);
                            setIsModalOpen(true);
                          }}
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
                        <button
                          onClick={() => handleDeleteClick(b)}
                          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
                        >
                          <svg
                            className="fill-current text-red-600"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M9 3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1h5a1 1 0 1 1 0 2h-1v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6H4a1 1 0 1 1 0-2h5V3Zm2 1h2V4h-2V4Zm-4 4h10v12H7V8Z"
                            />
                          </svg>
                          Delete
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="text-center py-4 text-gray-900 dark:text-white">
                      No buildings found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {/* <div className="flex justify-center items-center space-x-2">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50 text-gray-900 dark:text-white"
        >
          Previous
        </button>
        <span className="text-gray-900 dark:text-white">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50 text-gray-900 dark:text-white"
        >
          Next
        </button>
      </div> */}

      <div className="flex justify-center mt-4">
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Edit Modal */}
      {selectedBuilding && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-[600px] m-4">
          <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Edit Building</h3>
            <div className="space-y-4">
              <div>
                <Label>Building ID</Label>
                <Input type="text" defaultValue={selectedBuilding.buildingId} disabled />
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
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} className="max-w-[600px] m-4">
        <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add New Building</h3>
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
      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} className="max-w-[400px] m-4">
        <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Delete Building</h3>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            Are you sure you want to delete <span className="font-bold">{buildingToDelete?.name}</span>?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div >
  );
};

export default BuildingList;