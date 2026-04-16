"use client";

import { useParams } from "next/navigation";
import { CompanyDetailView } from "@/app/components/companies/CompanyDetailView";

export default function CompanyDetailPage() {
  const params = useParams();
  const companyKey = params.companyKey as string;

  return <CompanyDetailView companyKey={companyKey} backHref="/companies" backLabel="Back to Companies" />;
}
