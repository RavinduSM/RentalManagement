import RoomFacilityList from "@/components/room/roomFacilities/roomFacilitiesList";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Form Elements | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function FormElements() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Room Facilities" />
        <div className="space-y-6">
          <ComponentCard title="">
            <RoomFacilityList />
          </ComponentCard>
        </div>
    </div>
  );
}
