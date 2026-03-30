import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getLiquorImports } from "@/lib/data/liquor-imports";
import { LiquorImportsClient } from "./_components/liquor-imports-client";

export default async function LiquorImportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("station_id")
    .eq("id", user?.id ?? "")
    .single();

  const stationId = profile?.station_id;
  const liquorImports = stationId
    ? await getLiquorImports(stationId).catch(() => [])
    : [];

  async function createLiquorImportAction(data: Record<string, unknown>) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { createLiquorImport } = await import("@/lib/data/liquor-imports");
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
      await createLiquorImport(p.station_id, data);
      revalidatePath("/dashboard/liquor_imports");
    }
  }

  async function deleteLiquorImportAction(id: string) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { deleteLiquorImport } = await import("@/lib/data/liquor-imports");
    const sb = await createServerClient();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) return;
    await deleteLiquorImport(id);
    revalidatePath("/dashboard/liquor_imports");
  }

  return (
    <div className="space-y-6">
      <LiquorImportsClient
        initialData={liquorImports}
        createAction={createLiquorImportAction}
        deleteAction={deleteLiquorImportAction}
      />
    </div>
  );
}
