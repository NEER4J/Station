import { createClient } from "@/lib/supabase/server";
import { getSitesWithDetails } from "@/lib/data/site-details";
import { PageHeader } from "@/components/shared/page-header";
import { SitesClient } from "./_components/sites-client";

export default async function SitesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const sites = await getSitesWithDetails().catch(() => []);

  async function updateSiteDetailsAction(
    stationId: string,
    data: Record<string, unknown>,
  ) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { upsertSiteDetails } = await import("@/lib/data/site-details");
    const { revalidatePath } = await import("next/cache");

    const sb = await createServerClient();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) throw new Error("Not authenticated");

    await upsertSiteDetails(stationId, data);
    revalidatePath("/dashboard/administration/sites");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sites"
        subtitle="View and manage station locations and connectivity"
        backHref="/dashboard"
      />
      <SitesClient
        initialData={sites}
        updateAction={updateSiteDetailsAction}
      />
    </div>
  );
}
