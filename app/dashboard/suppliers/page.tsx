import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getSuppliers } from "@/lib/data/suppliers";
import type { SupplierFormData } from "@/lib/validations/suppliers";
import { SuppliersClient } from "./suppliers-client";

export default async function SuppliersPage() {
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
  const suppliers = stationId
    ? await getSuppliers(stationId).catch(() => [])
    : [];

  async function createSupplierAction(data: SupplierFormData) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { createSupplier } = await import("@/lib/data/suppliers");
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
      await createSupplier(p.station_id, data);
      revalidatePath("/dashboard/suppliers");
    }
  }

  async function updateSupplierAction(id: string, data: SupplierFormData) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { updateSupplier } = await import("@/lib/data/suppliers");
    const sb = await createServerClient();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) return;
    await updateSupplier(id, data);
    revalidatePath("/dashboard/suppliers");
  }

  async function deleteSupplierAction(id: string) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { deleteSupplier } = await import("@/lib/data/suppliers");
    const sb = await createServerClient();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) return;
    await deleteSupplier(id);
    revalidatePath("/dashboard/suppliers");
  }

  return (
    <SuppliersClient
      initialData={suppliers}
      createAction={createSupplierAction}
      updateAction={updateSupplierAction}
      deleteAction={deleteSupplierAction}
    />
  );
}
