import { createClient } from "@/lib/supabase/server";
import { getTenderCoupons } from "@/lib/data/tender-coupons";
import { TenderCouponsClient } from "./_components/tender-coupons-client";

export default async function TenderCouponsPage() {
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

  const tenderCoupons = stationId
    ? await getTenderCoupons(stationId).catch(() => [])
    : [];

  async function createTenderCouponAction(data: Record<string, unknown>) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { createTenderCoupon } = await import("@/lib/data/tender-coupons");
    const { revalidatePath } = await import("next/cache");

    const sb = await createServerClient();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) throw new Error("Not authenticated");

    const { data: p } = await sb
      .from("user_profiles")
      .select("station_id")
      .eq("id", u.id)
      .single();

    if (!p?.station_id) return;

    await createTenderCoupon(p.station_id, data);
    revalidatePath("/dashboard/tender_coupons");
  }

  async function updateTenderCouponAction(
    id: string,
    data: Record<string, unknown>,
  ) {
    "use server";
    const { updateTenderCoupon } = await import("@/lib/data/tender-coupons");
    const { revalidatePath } = await import("next/cache");

    await updateTenderCoupon(id, data);
    revalidatePath("/dashboard/tender_coupons");
  }

  async function deleteTenderCouponAction(id: string) {
    "use server";
    const { deleteTenderCoupon } = await import("@/lib/data/tender-coupons");
    const { revalidatePath } = await import("next/cache");

    await deleteTenderCoupon(id);
    revalidatePath("/dashboard/tender_coupons");
  }

  return (
    <div className="space-y-6">
      <TenderCouponsClient
        initialData={tenderCoupons}
        createAction={createTenderCouponAction}
        updateAction={updateTenderCouponAction}
        deleteAction={deleteTenderCouponAction}
      />
    </div>
  );
}
