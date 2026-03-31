import { createClient } from "@/lib/supabase/server";
import type {
  BT9000Department,
  BT9000PriceGroup,
  BT9000Item,
  BT9000DealGroup,
  BT9000Payout,
  BT9000TenderCoupon,
  BT9000Import,
} from "@/types/database";
import { PageHeader } from "@/components/shared/page-header";
import { BT9000ImportClient } from "./_components/bt9000-import-client";

export default async function BT9000ImportPage() {
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

  let importHistory: BT9000Import[] = [];
  if (stationId) {
    const { getBT9000Imports } = await import("@/lib/data/bt9000-import");
    importHistory = await getBT9000Imports(stationId).catch(() => []);
  }

  // --- Server Actions ---

  async function importDepartmentsAction(
    departments: BT9000Department[],
  ): Promise<Record<string, string>> {
    "use server";
    const { createClient: sc } = await import("@/lib/supabase/server");
    const { importBT9000Departments } = await import("@/lib/data/bt9000-import");
    const sb = await sc();
    const { data: { user: u } } = await sb.auth.getUser();
    if (!u) throw new Error("Not authenticated");
    const { data: p } = await sb.from("user_profiles").select("station_id").eq("id", u.id).single();
    if (!p?.station_id) throw new Error("No station assigned");
    return importBT9000Departments(p.station_id, departments);
  }

  async function importPriceGroupsAction(
    priceGroups: BT9000PriceGroup[],
  ): Promise<Record<string, string>> {
    "use server";
    const { createClient: sc } = await import("@/lib/supabase/server");
    const { importBT9000PriceGroups } = await import("@/lib/data/bt9000-import");
    const sb = await sc();
    const { data: { user: u } } = await sb.auth.getUser();
    if (!u) throw new Error("Not authenticated");
    const { data: p } = await sb.from("user_profiles").select("station_id").eq("id", u.id).single();
    if (!p?.station_id) throw new Error("No station assigned");
    return importBT9000PriceGroups(p.station_id, priceGroups);
  }

  async function importItemsBatchAction(
    items: BT9000Item[],
    departmentMap: Record<string, string>,
    priceGroupMap: Record<string, string>,
  ): Promise<number> {
    "use server";
    const { createClient: sc } = await import("@/lib/supabase/server");
    const { importBT9000Items } = await import("@/lib/data/bt9000-import");
    const sb = await sc();
    const { data: { user: u } } = await sb.auth.getUser();
    if (!u) throw new Error("Not authenticated");
    const { data: p } = await sb.from("user_profiles").select("station_id").eq("id", u.id).single();
    if (!p?.station_id) throw new Error("No station assigned");
    return importBT9000Items(p.station_id, items, departmentMap, priceGroupMap);
  }

  async function importDealGroupsAction(
    dealGroups: BT9000DealGroup[],
  ): Promise<number> {
    "use server";
    const { createClient: sc } = await import("@/lib/supabase/server");
    const { importBT9000DealGroups } = await import("@/lib/data/bt9000-import");
    const sb = await sc();
    const { data: { user: u } } = await sb.auth.getUser();
    if (!u) throw new Error("Not authenticated");
    const { data: p } = await sb.from("user_profiles").select("station_id").eq("id", u.id).single();
    if (!p?.station_id) throw new Error("No station assigned");
    return importBT9000DealGroups(p.station_id, dealGroups);
  }

  async function importPayoutsAction(
    payouts: BT9000Payout[],
  ): Promise<number> {
    "use server";
    const { createClient: sc } = await import("@/lib/supabase/server");
    const { importBT9000Payouts } = await import("@/lib/data/bt9000-import");
    const sb = await sc();
    const { data: { user: u } } = await sb.auth.getUser();
    if (!u) throw new Error("Not authenticated");
    const { data: p } = await sb.from("user_profiles").select("station_id").eq("id", u.id).single();
    if (!p?.station_id) throw new Error("No station assigned");
    return importBT9000Payouts(p.station_id, payouts);
  }

  async function importTenderCouponsAction(
    tenderCoupons: BT9000TenderCoupon[],
  ): Promise<number> {
    "use server";
    const { createClient: sc } = await import("@/lib/supabase/server");
    const { importBT9000TenderCoupons } = await import("@/lib/data/bt9000-import");
    const sb = await sc();
    const { data: { user: u } } = await sb.auth.getUser();
    if (!u) throw new Error("Not authenticated");
    const { data: p } = await sb.from("user_profiles").select("station_id").eq("id", u.id).single();
    if (!p?.station_id) throw new Error("No station assigned");
    return importBT9000TenderCoupons(p.station_id, tenderCoupons);
  }

  async function recordImportAction(
    data: {
      file_name: string;
      bt9000_version: string | null;
      bt9000_station_id: string | null;
      file_creation_date: string | null;
      departments_count: number;
      items_count: number;
      price_groups_count: number;
      deal_groups_count: number;
      payouts_count: number;
      tender_coupons_count: number;
    },
  ): Promise<string> {
    "use server";
    const { createClient: sc } = await import("@/lib/supabase/server");
    const { createBT9000Import } = await import("@/lib/data/bt9000-import");
    const { revalidatePath } = await import("next/cache");
    const sb = await sc();
    const { data: { user: u } } = await sb.auth.getUser();
    if (!u) throw new Error("Not authenticated");
    const { data: p } = await sb.from("user_profiles").select("station_id").eq("id", u.id).single();
    if (!p?.station_id) throw new Error("No station assigned");
    const id = await createBT9000Import(p.station_id, { ...data, status: "completed" }, u.id);
    revalidatePath("/dashboard/bt9000_import");
    revalidatePath("/dashboard/Items");
    revalidatePath("/dashboard/departments");
    revalidatePath("/dashboard/payouts");
    return id;
  }

  async function deleteImportAction(id: string): Promise<void> {
    "use server";
    const { createClient: sc } = await import("@/lib/supabase/server");
    const { deleteBT9000Import } = await import("@/lib/data/bt9000-import");
    const { revalidatePath } = await import("next/cache");
    const sb = await sc();
    const { data: { user: u } } = await sb.auth.getUser();
    if (!u) throw new Error("Not authenticated");
    await deleteBT9000Import(id);
    revalidatePath("/dashboard/bt9000_import");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="BT9000 Price Book Import"
        subtitle="Sync departments, items, price groups, and more from Bulloch BT9000"
        backHref="/dashboard"
      />
      <BT9000ImportClient
        importHistory={importHistory}
        importDepartmentsAction={importDepartmentsAction}
        importPriceGroupsAction={importPriceGroupsAction}
        importItemsBatchAction={importItemsBatchAction}
        importDealGroupsAction={importDealGroupsAction}
        importPayoutsAction={importPayoutsAction}
        importTenderCouponsAction={importTenderCouponsAction}
        recordImportAction={recordImportAction}
        deleteImportAction={deleteImportAction}
      />
    </div>
  );
}
