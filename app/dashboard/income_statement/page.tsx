import { createClient } from "@/lib/supabase/server";
import { getIncomeStatementEntries, buildIncomeStatementRows, generateIncomeStatement, upsertIncomeStatementEntry } from "@/lib/data/income-statement";
import { PageHeader } from "@/components/shared/page-header";
import { IncomeStatementClient } from "./_components/income-statement-client";

export default async function IncomeStatementPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year: yearParam } = await searchParams;
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

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

  const stationId = profile?.station_id ?? "";

  const entries = stationId
    ? await getIncomeStatementEntries(stationId, year).catch(() => [])
    : [];

  const rows = buildIncomeStatementRows(entries);

  async function generateAction(actionYear: number) {
    "use server";
    const { generateIncomeStatement: gen } = await import("@/lib/data/income-statement");
    const { revalidatePath } = await import("next/cache");
    const sb = await (await import("@/lib/supabase/server")).createClient();
    const { data: { user: u } } = await sb.auth.getUser();
    if (!u) return;
    const { data: p } = await sb.from("user_profiles").select("station_id").eq("id", u.id).single();
    if (!p?.station_id) return;
    await gen(p.station_id, actionYear);
    revalidatePath("/dashboard/income_statement");
  }

  async function upsertEntryAction(
    entryYear: number,
    entry: {
      month: number;
      section: string;
      line_item: string;
      sort_order: number;
      amount: number;
    },
  ) {
    "use server";
    const { upsertIncomeStatementEntry: upsert } = await import("@/lib/data/income-statement");
    const { revalidatePath } = await import("next/cache");
    const sb = await (await import("@/lib/supabase/server")).createClient();
    const { data: { user: u } } = await sb.auth.getUser();
    if (!u) return;
    const { data: p } = await sb.from("user_profiles").select("station_id").eq("id", u.id).single();
    if (!p?.station_id) return;
    await upsert(p.station_id, entryYear, { ...entry, is_override: true });
    revalidatePath("/dashboard/income_statement");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Income Statement"
        subtitle="Annual profit and loss by month"
        backHref="/dashboard"
      />
      <IncomeStatementClient
        year={year}
        rows={rows}
        generateAction={generateAction}
        upsertEntryAction={upsertEntryAction}
      />
    </div>
  );
}
