import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TenantList from "@/components/tenants/tenantList";
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
      <PageBreadcrumb pageTitle="Tenant" />
        <div className="space-y-6">
          <ComponentCard title="Basic Table 1">
            <TenantList />
          </ComponentCard>
        </div>
    </div>
  );
}
