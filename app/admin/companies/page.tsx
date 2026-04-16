"use client";

import { CompanyDirectory } from "@/app/components/companies/CompanyDirectory";

export default function AdminCompaniesPage() {
  return (
    <CompanyDirectory
      detailBasePath="/admin/companies"
      eyebrow="Admin Company Oversight"
      title="Review the full company footprint across the whole team."
      description="Admins can browse all company accounts, filter by sales rep ownership, and open the same account detail workspace with cross-team visibility."
    />
  );
}
