"use client";

import { useParams } from "next/navigation";
import { CompanyDetailView } from "@/app/components/companies/CompanyDetailView";

export default function AdminCompanyDetailPage() {
  const params = useParams();
  const companyKey = params.companyKey as string;

  return (
    <CompanyDetailView
      companyKey={companyKey}
      backHref="/admin/companies"
      backLabel="Back to Companies"
      leadBasePath="/admin/leads"
    />
  );
}
