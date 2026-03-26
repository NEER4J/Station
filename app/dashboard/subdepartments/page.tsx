import { createClient } from "@/lib/supabase/server";
import { getSubdepartments } from "@/lib/data/subdepartments";
import { getDepartments } from "@/lib/data/departments";
import { PageHeader } from "@/components/shared/page-header";
import { SubdepartmentsClient } from "./_components/subdepartments-client";

export default async function SubdepartmentsPage() {
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

  const [subdepartments, departments] = await Promise.all([
    stationId ? getSubdepartments(stationId).catch(() => []) : [],
    stationId ? getDepartments(stationId).catch(() => []) : [],
  ]);

  async function createSubdepartmentAction(data: Record<string, unknown>) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { createSubdepartment } = await import("@/lib/data/subdepartments");
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

    await createSubdepartment(p.station_id, data);
    revalidatePath("/dashboard/subdepartments");
  }

  async function updateSubdepartmentAction(
    id: string,
    data: Record<string, unknown>,
  ) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { updateSubdepartment } = await import("@/lib/data/subdepartments");
    const { revalidatePath } = await import("next/cache");

    const sb = await createServerClient();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) throw new Error("Not authenticated");

    await updateSubdepartment(id, data);
    revalidatePath("/dashboard/subdepartments");
  }

  async function deleteSubdepartmentAction(id: string) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { deleteSubdepartment } = await import("@/lib/data/subdepartments");
    const { revalidatePath } = await import("next/cache");

    const sb = await createServerClient();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) throw new Error("Not authenticated");

    await deleteSubdepartment(id);
    revalidatePath("/dashboard/subdepartments");
  }

  return (
    <div className="space-y-6">
      <SubdepartmentsClient
        initialData={subdepartments}
        departments={departments}
        createAction={createSubdepartmentAction}
        updateAction={updateSubdepartmentAction}
        deleteAction={deleteSubdepartmentAction}
      />
    </div>
  );
}
