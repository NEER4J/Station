import { createClient } from "@/lib/supabase/server";
import { getVendors } from "@/lib/data/vendors";
import { VendorsClient } from "./_components/vendors-client";

export default async function VendorsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("station_id")
    .eq("id", user.id)
    .single();

  const stationId = profile?.station_id;
  if (!stationId) return null;

  const vendors = await getVendors(stationId).catch(() => []);

  async function createVendorAction(data: Record<string, unknown>) {
    "use server";
    const { createVendor } = await import("@/lib/data/vendors");
    const { revalidatePath } = await import("next/cache");
    const { createClient: sc } = await import("@/lib/supabase/server");

    const sb = await sc();
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
      await createVendor(p.station_id, data);
      revalidatePath("/dashboard/administration/vendors");
    }
  }

  async function updateVendorAction(id: string, data: Record<string, unknown>) {
    "use server";
    const { updateVendor } = await import("@/lib/data/vendors");
    const { revalidatePath } = await import("next/cache");

    await updateVendor(id, data);
    revalidatePath("/dashboard/administration/vendors");
  }

  async function deleteVendorAction(id: string) {
    "use server";
    const { deleteVendor } = await import("@/lib/data/vendors");
    const { revalidatePath } = await import("next/cache");

    await deleteVendor(id);
    revalidatePath("/dashboard/administration/vendors");
  }

  return (
    <div className="space-y-6">
      <VendorsClient
        initialData={vendors}
        createAction={createVendorAction}
        updateAction={updateVendorAction}
        deleteAction={deleteVendorAction}
      />
    </div>
  );
}
