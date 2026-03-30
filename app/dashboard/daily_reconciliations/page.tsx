import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getDailyReconciliations } from "@/lib/data/daily-reconciliations";
import { PageHeader } from "@/components/shared/page-header";
import { ReconciliationsClient } from "./_components/reconciliations-client";

export default async function DailyReconciliationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("station_id")
    .eq("id", user?.id ?? "")
    .single();

  const stationId = profile?.station_id ?? "";

  const reconciliations = stationId
    ? await getDailyReconciliations(stationId).catch(() => [])
    : [];

  async function createReconciliationAction(data: Record<string, unknown>) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { createDailyReconciliation } = await import(
      "@/lib/data/daily-reconciliations"
    );
    const sb = await createServerClient();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) return;
    const { data: p } = await sb
      .from("user_profiles")
      .select("station_id")
      .eq("id", u.id)
      .single();
    if (p?.station_id) {
      await createDailyReconciliation(p.station_id, data);
      revalidatePath("/dashboard/daily_reconciliations");
    }
  }

  async function updateReconciliationAction(
    id: string,
    data: Record<string, unknown>,
  ) {
    "use server";
    const { updateDailyReconciliation } = await import(
      "@/lib/data/daily-reconciliations"
    );
    await updateDailyReconciliation(id, data);
    revalidatePath("/dashboard/daily_reconciliations");
  }

  async function deleteReconciliationAction(id: string) {
    "use server";
    const { deleteDailyReconciliation } = await import(
      "@/lib/data/daily-reconciliations"
    );
    await deleteDailyReconciliation(id);
    revalidatePath("/dashboard/daily_reconciliations");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Reconciliations"
        subtitle="Track and reconcile daily sales and fuel reports"
        backHref="/dashboard"
      />
      <ReconciliationsClient
        initialData={reconciliations}
        createAction={createReconciliationAction}
        updateAction={updateReconciliationAction}
        deleteAction={deleteReconciliationAction}
      />
    </div>
  );
}
