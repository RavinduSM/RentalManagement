"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

interface Building {
  _id: string;
  buildingId: string;
  name: string;
  location: string;
}

interface BuildingEditModalProps {
  building: Building;
  onSave: (updated: Building) => void;
}

export default function BuildingEditModal({ building, onSave }: BuildingEditModalProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [formData, setFormData] = useState<Building>(building);

  useEffect(() => {
    setFormData(building);
  }, [building]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/building/${building._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update building");

      const updated = await res.json();
      onSave(updated);
      setIsOpen(false); // close modal after save
    } catch (error) {
      console.error("Error updating building:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} className="max-w-[700px] m-4">
      <div className="relative w-full max-w-[700px] rounded-3xl bg-white p-6 dark:bg-gray-900">
        <div className="px-2">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Building Information
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Update building details to keep records accurate.
          </p>
        </div>

        <form className="flex flex-col">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2 px-2">

            <div className="col-span-2 lg:col-span-1">
              <Label>Building ID</Label>
              <Input
                type="text"
                name="buildingId"
                value={formData.buildingId}
                readOnly
                className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
              />
            </div>
           
            <div className="col-span-2 lg:col-span-1">
              <Label>Building Name</Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="col-span-2">
              <Label>Location</Label>
              <Input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
