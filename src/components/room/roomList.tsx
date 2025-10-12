"use client";

import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import Pagination from "../../components/tables/Pagination";
import Label from "../form/Label";
import Input from "../form/input/InputField";

interface Room {
  _id: string;
  roomId: String, 
  buildingId: String, 
  name: String,
  description: String, 
  isActive: Boolean | null, 
}

const roomList: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"enable" | "disable">("disable");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({ 
    buildingId: "", 
    name: "", 
    description: "" ,
    facilities: "",
    basePrice: "",
  });

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/room?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`
      );
      const data = await res.json();
      console.log("Fetched rooms response:", data);
      setRooms(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [page, search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // Add Tenant
 const handleAddRoom = async () => {
    try {
      const payload = {
        ...newRoom,
        facilities: newRoom.facilities
          ? newRoom.facilities.split(",").map((f) => f.trim())
          : [],
        basePrice: Number(newRoom.basePrice) || 0,
      };

      const res = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add room");
      }

      toast.success("Room added successfully");
      setIsAddModalOpen(false);
      setNewRoom({ buildingId: "", name: "", description: "", facilities: "", basePrice: "" });
      fetchRooms();
    } catch (err: any) {
      console.error("Error adding room:", err);
      toast.error(err.message || "Something went wrong");
    }
  };




  const handleActionClick = (room: Room, action: "enable" | "disable") => {
    if (!room._id) {
      console.error("Room missing _id:", room);
      return;
    }
    setSelectedRoom(room);
    setActionType(action);
    setIsActionModalOpen(true);
  };

  const handlePerformAction = async () => {
    if (!selectedRoom?._id) return;
    try {
      const res = await fetch(`/api/room?id=${selectedRoom._id}&action=${actionType}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to update tenant");
      setIsActionModalOpen(false);
      setSelectedRoom(null);
      fetchRooms();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (room: Room) => {
    if (!room._id) {
      console.error("Room missing _id:", room);
      return;
    }
    setSelectedRoom(room);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (updatedRoom: any) => {
    if (!selectedRoom?._id) return;

    const payload = {
      buildingId: updatedRoom.buildingId,
      name: updatedRoom.name,
      description: updatedRoom.description,
      facilities: updatedRoom.facilities
        ? updatedRoom.facilities.split(",").map((f: string) => f.trim())
        : [],
      newPrice: Number(updatedRoom.newPrice) || undefined,
    };

    try {
      const res = await fetch(`/api/room?id=${selectedRoom._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to edit room");

      toast.success("Room updated successfully");
      setIsEditModalOpen(false);
      setSelectedRoom(null);
      fetchRooms();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error updating room");
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
      <Button onClick={() => setIsAddModalOpen(true)}>+ Add Tenant</Button>
    </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[900px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {["Room ID", "Building Id", "name", "description", "Status", "Actions"].map(
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
                ) : rooms.length > 0 ? (
                  rooms.map((room) => (
                    <TableRow key={room._id}>
                      <TableCell className="px-5 py-3 text-gray-900 dark:text-white">{room.roomId}</TableCell>
                      <TableCell className="px-5 py-3 text-gray-900 dark:text-white">{room.buildingId}</TableCell>
                      <TableCell className="px-5 py-3 text-gray-900 dark:text-white">{room.name}</TableCell>
                      <TableCell className="px-5 py-3 text-gray-900 dark:text-white">{room.description}</TableCell>
                      <TableCell className="px-4 py-3 ">
                        <Badge
                          color={
                            room.isActive === true
                              ? "success"
                              : room.isActive === false
                              ? "warning"
                              : "error"
                          }
                        >
                          {room.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEditClick(room)}
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
                            room.isActive
                              ? handleActionClick(room, "disable")
                              : handleActionClick(room, "enable")
                          }
                          className={`flex w-full items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-medium shadow-theme-xs lg:inline-flex lg:w-auto ${
                            room.isActive
                              ? "border-gray-300 text-red-500 hover:bg-red-50 hover:text-red-600 dark:border-gray-700 dark:text-red-400 dark:hover:bg-white/[0.03] dark:hover:text-red-300"
                              : "border-gray-300 text-green-500 hover:bg-green-50 hover:text-green-600 dark:border-gray-700 dark:text-green-400 dark:hover:bg-white/[0.03] dark:hover:text-green-300"
                          }`}
                        >
                          {room.isActive ? "Disable" : "Enable"}
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow key="no-data">
                    <TableCell colSpan={7} className="text-center py-4">
                      No rooms found.
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
              + Add New Room
            </h3>

            <div className="space-y-4">
              <div>
                <Label>Building ID</Label>
                <Input
                  type="text"
                  value={newRoom.buildingId}
                  onChange={(e) => setNewRoom({ ...newRoom, buildingId: e.target.value })}
                />
              </div>

              <div>
                <Label>Room Name</Label>
                <Input
                  type="text"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                />
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  type="text"
                  value={newRoom.description}
                  onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Facilities (comma-separated)</Label>
                <Input
                  type="text"
                  value={newRoom.facilities}
                  onChange={(e) => setNewRoom({ ...newRoom, facilities: e.target.value })}
                />
              </div>

              <div>
                <Label>Base Price</Label>
                <Input
                  type="number"
                  value={newRoom.basePrice}
                  onChange={(e) => setNewRoom({ ...newRoom, basePrice: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddRoom}
                disabled={!newRoom.name}
              >
                Add Room
              </Button>
            </div>
          </div>
        </Modal>


      {/* Enable/Disable Modal */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => {
          setIsActionModalOpen(false);
          setSelectedRoom(null);
        }}
        className="max-w-[600px] m-4"
      >
        <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {actionType === "disable" ? "Disable Room" : "Enable Room"}
          </h3>
          <p className="mb-6 text-gray-900 dark:text-white">
            Are you sure you want to {actionType}{" "}
            <span className="font-bold">{selectedRoom?.name}</span>?
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
      {selectedRoom && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedRoom(null);
          }}
          className="max-w-[600px] m-4"
        >
          <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Edit Room</h3>
            <div className="space-y-4">
            <div>
              <Label>Building Id</Label>
              <Input
                type="text"
                defaultValue={selectedRoom?.buildingId || ""}
                onChange={(e) =>
                  setSelectedRoom({ ...selectedRoom, buildingId: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Room Name</Label>
              <Input
                type="text"
                placeholder="Room Name"
                defaultValue={selectedRoom?.name || ""}
                onChange={(e) =>
                  setSelectedRoom({ ...selectedRoom, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                type="text"
                defaultValue={selectedRoom?.description || ""}
                onChange={(e) =>
                  setSelectedRoom({ ...selectedRoom, description: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Facilities (comma-separated)</Label>
              <Input
                type="text"
                placeholder="WiFi, AC, TV"
                value={selectedRoom?.facilities || ""}
                onChange={(e) =>
                  setSelectedRoom({ ...selectedRoom, facilities: e.target.value })
                }
              />
            </div>

            <div>
              <Label>New Price</Label>
              <Input
                type="number"
                placeholder="Enter new price"
                value={selectedRoom?.newPrice || ""}
                onChange={(e) =>
                  setSelectedRoom({ ...selectedRoom, newPrice: e.target.value })
                }
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => selectedRoom && handleEditSubmit(selectedRoom)}>
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

export default roomList;
