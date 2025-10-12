"use client";

import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../ui/table";
import Button from "../../ui/button/Button";
import { Modal } from "../../ui/modal";
import Pagination from "../../../components/tables/Pagination";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";

interface RoomFacility {
  _id: string;
  facilityId: string,
  name: String, 
  description: String, 
  price: String,
  isActive: Boolean | null, 
}

const RomList: React.FC = () => {
  const [roomFacilities, setRoomFacilities] = useState<RoomFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedRoomFacilities, setSelectedRoomFacilities] = useState<RoomFacility | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"enable" | "disable">("disable");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRoomFacilities, setNewRoomFacilities] = useState({ 
    facilityId: "", 
    name: "", 
    description: "" ,
    price: "",
  });

  const fetchRoomFacilities = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/room/roomFacilities?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`
      );
      const data = await res.json();
      //console.log("Fetched room facilities response:", data);
      setRoomFacilities(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch room facilities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomFacilities();
  }, [page, search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // Add Room Facilities
 const handleAddRoomFacility = async () => {
    try {
      const payload = {
        ...newRoomFacilities,
      };

      const res = await fetch("/api/room/roomFacilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add room");
      }

      toast.success("Room facility added successfully");
      setIsAddModalOpen(false);
      setNewRoomFacilities({ facilityId: "", name: "", description: "", price: "" });
      fetchRoomFacilities();
    } catch (err: any) {
      console.error("Error adding room facility:", err);
      toast.error(err.message || "Something went wrong");
    }
  };

    //  edit room facilities
    const handleEditClick = (room: RoomFacility) => {
        if (!room._id) {
        console.error("Room missing _id:", room);
        return;
        }
        setSelectedRoomFacilities(room);
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (updatedRoomFacility: any) => {
        if (!selectedRoomFacilities?._id) return;

        const payload = {
        facilityId: updatedRoomFacility.facilityId,
        name: updatedRoomFacility.name,
        description: updatedRoomFacility.description,
        price: updatedRoomFacility.price
        };

        try {
        const res = await fetch(`/api/room/roomFacilities?id=${selectedRoomFacilities._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to edit room");

        toast.success("Room updated successfully");
        setIsEditModalOpen(false);
        setSelectedRoomFacilities(null);
        fetchRoomFacilities();
        } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Error updating room");
        }
    };

   const handleDeleteFacility = async () => {
    if (!selectedRoomFacilities?._id) return;

    try {
      const res = await fetch(`/api/room/roomFacilities?id=${selectedRoomFacilities._id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete facility");
      }

      toast.success("Facility deleted successfully");
      setIsActionModalOpen(false);
      setSelectedRoomFacilities(null);
      fetchRoomFacilities(); // refresh table after deletion
    } catch (err: any) {
      console.error("Error deleting facility:", err);
      toast.error(err.message || "Something went wrong");
    }
  };



  return (
    <div className="space-y-4">
      {/* Top controls */}
      <div className="flex items-center justify-between">
      <input
        type="text"
        placeholder="Search by Name, facilityId..."
        value={search}
        onChange={handleSearchChange}
        className="w-full max-w-sm rounded border px-4 py-2 text-gray-900 dark:text-white"
      />
      <Button onClick={() => setIsAddModalOpen(true)}>+ Add Facility</Button>
    </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[900px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {["Facility ID", "name", "description", "Actions"].map(
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
                    <TableCell colSpan={7} className="text-center py-4 text-gray-900 dark:text-white">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : roomFacilities.length > 0 ? (
                  roomFacilities.map((roomFacility) => (
                    <TableRow key={roomFacility._id}>
                      <TableCell className="px-5 py-3 text-gray-900 dark:text-white">{roomFacility.facilityId}</TableCell>
                      <TableCell className="px-5 py-3 text-gray-900 dark:text-white">{roomFacility.name}</TableCell>
                      <TableCell className="px-5 py-3 text-gray-900 dark:text-white">{roomFacility.description}</TableCell>
                      <TableCell className="flex gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEditClick(roomFacility)}
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
                        {/* Delete Button */}
                        <button
                          onClick={() => {
                            setSelectedRoomFacilities(roomFacility);
                            setIsActionModalOpen(true); 
                          }}
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
                  <TableRow key="no-data">
                    <TableCell colSpan={7} className="text-center py-4">
                      No Room Facilities Found.
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

        {/* Add Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          className="max-w-[600px] m-4"
        >
          <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Add New Facility
            </h3>

            <div className="space-y-4">
              <div>
                <Label>Facility Name</Label>
                <Input
                  type="text"
                  value={newRoomFacilities.name}
                  onChange={(e) => setNewRoomFacilities({ ...newRoomFacilities, name: e.target.value })}
                />
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  type="text"
                  value={newRoomFacilities.description}
                  onChange={(e) => setNewRoomFacilities({ ...newRoomFacilities, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  value={newRoomFacilities.price}
                  onChange={(e) => setNewRoomFacilities({ ...newRoomFacilities, price: e.target.value })}
                />
              </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddRoomFacility}
                disabled={!newRoomFacilities.name}
              >
                Add Facility
              </Button>
            </div>
          </div>
          </div>
        </Modal>


      {/* Delete Modal */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => {
          setIsActionModalOpen(false);
          setSelectedRoomFacilities(null);
        }}
        className="max-w-[600px] m-4"
      >
        <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Delete Facility
          </h3>
          <p className="mb-6 text-gray-900 dark:text-white">
            Are you sure you want to delete{" "}
            <span className="font-bold">{selectedRoomFacilities?.name}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsActionModalOpen(false)}
              className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteFacility}
              className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>


      {/* Edit Modal */}
      {selectedRoomFacilities && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedRoomFacilities(null);
          }}
          className="max-w-[600px] m-4"
        >
          <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Edit Facility</h3>
            <div className="space-y-4">
            <div>
              <Label>Facility Id</Label>
              <Input
                type="text"
                defaultValue={selectedRoomFacilities?.facilityId || ""}
                disabled
                onChange={(e) =>
                  setSelectedRoomFacilities({ ...selectedRoomFacilities, facilityId: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Facility Name</Label>
              <Input
                type="text"
                placeholder="Facility Name"
                defaultValue={selectedRoomFacilities?.name || ""}
                onChange={(e) =>
                  setSelectedRoomFacilities({ ...selectedRoomFacilities, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                type="text"
                defaultValue={selectedRoomFacilities?.description || ""}
                onChange={(e) =>
                  setSelectedRoomFacilities({ ...selectedRoomFacilities, description: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Facility Price</Label>
              <Input
                type="number"
                placeholder="Enter Facility price"
                defaultValue={selectedRoomFacilities?.price || ""}
                onChange={(e) =>
                  setSelectedRoomFacilities({ ...selectedRoomFacilities, price: e.target.value })
                }
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => selectedRoomFacilities && handleEditSubmit(selectedRoomFacilities)}>
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

export default RomList;
