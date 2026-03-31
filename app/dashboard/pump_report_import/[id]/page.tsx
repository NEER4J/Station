import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPumpReport } from "@/lib/data/pump-reports";
import { PageHeader } from "@/components/shared/page-header";
import { PumpReportDetailClient } from "../_components/pump-report-detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PumpReportDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const report = await getPumpReport(id).catch(() => null);
  if (!report) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Pump Report — ${report.business_date}`}
        subtitle={report.site_name ?? "Daily pump report details"}
        backHref="/dashboard/pump_report_import"
      />
      <PumpReportDetailClient report={report} />
    </div>
  );
}
