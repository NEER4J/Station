import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getPayouts } from "@/lib/data/payouts";
import type { PayoutFormData } from "@/lib/validations/payouts";
import { PayoutsClient } from "./payouts-client";

export default async function PayoutsPage() {
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
  const payouts = stationId
    ? await getPayouts(stationId).catch(() => [])
    : [];

  async function createPayoutAction(data: PayoutFormData) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { createPayout } = await import("@/lib/data/payouts");
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
      await createPayout(p.station_id, data);
      revalidatePath("/dashboard/payouts");
    }
  }

  async function updatePayoutAction(id: string, data: PayoutFormData) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { updatePayout } = await import("@/lib/data/payouts");
    const sb = await createServerClient();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) return;
    await updatePayout(id, data);
    revalidatePath("/dashboard/payouts");
  }

  async function deletePayoutAction(id: string) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { deletePayout } = await import("@/lib/data/payouts");
    const sb = await createServerClient();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) return;
    await deletePayout(id);
    revalidatePath("/dashboard/payouts");
  }

  return (
    <PayoutsClient
      initialData={payouts}
      createAction={createPayoutAction}
      updateAction={updatePayoutAction}
      deleteAction={deletePayoutAction}
    />
  );
}
