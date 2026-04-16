"use client";

import { CompanyDirectory } from "@/app/components/companies/CompanyDirectory";

export default function CompaniesPage() {
  return (
    <CompanyDirectory
      detailBasePath="/companies"
      eyebrow="Account Follow-Up Workspace"
      title="Track every company, not just one contact."
      description="Browse company accounts in a compact list, filter quickly, and open the same full account view when you need details."
    />
  );
}
