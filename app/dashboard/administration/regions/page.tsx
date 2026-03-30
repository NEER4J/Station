import { createClient } from "@/lib/supabase/server";
import { getRegions } from "@/lib/data/regions";
import { RegionsClient } from "./_components/regions-client";

export default async function RegionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Auth check only — regions are not station-scoped
  if (!user) return null;

  const regions = await getRegions().catch(() => []);

  async function createRegionAction(data: Record<string, unknown>) {
    "use server";
    const { createRegion } = await import("@/lib/data/regions");
    const { revalidatePath } = await import("next/cache");

    await createRegion(data);
    revalidatePath("/dashboard/administration/regions");
  }

  async function updateRegionAction(id: string, data: Record<string, unknown>) {
    "use server";
    const { updateRegion } = await import("@/lib/data/regions");
    const { revalidatePath } = await import("next/cache");

    await updateRegion(id, data);
    revalidatePath("/dashboard/administration/regions");
  }

  async function deleteRegionAction(id: string) {
    "use server";
    const { deleteRegion } = await import("@/lib/data/regions");
    const { revalidatePath } = await import("next/cache");

    await deleteRegion(id);
    revalidatePath("/dashboard/administration/regions");
  }

  return (
    <div className="space-y-6">
      <RegionsClient
        initialData={regions}
        createAction={createRegionAction}
        updateAction={updateRegionAction}
        deleteAction={deleteRegionAction}
      />
    </div>
  );
}
