import { createClient } from "@/lib/supabase/server";
import { getDepartments } from "@/lib/data/departments";
import { PageHeader } from "@/components/shared/page-header";
import { DepartmentsClient } from "./_components/departments-client";

export default async function DepartmentsPage() {
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

  const departments = stationId
    ? await getDepartments(stationId).catch(() => [])
    : [];

  async function createDepartmentAction(formData: Record<string, unknown>) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { createDepartment } = await import("@/lib/data/departments");
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

    await createDepartment(p.station_id, formData);
    revalidatePath("/dashboard/departments");
  }

  async function updateDepartmentAction(
    id: string,
    formData: Record<string, unknown>,
  ) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { updateDepartment } = await import("@/lib/data/departments");
    const { revalidatePath } = await import("next/cache");

    const sb = await createServerClient();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) throw new Error("Not authenticated");

    await updateDepartment(id, formData);
    revalidatePath("/dashboard/departments");
  }

  async function deleteDepartmentAction(id: string) {
    "use server";
    const { createClient: createServerClient } = await import(
      "@/lib/supabase/server"
    );
    const { deleteDepartment } = await import("@/lib/data/departments");
    const { revalidatePath } = await import("next/cache");

    const sb = await createServerClient();
    const {
      data: { user: u },
    } = await sb.auth.getUser();
    if (!u) throw new Error("Not authenticated");

    await deleteDepartment(id);
    revalidatePath("/dashboard/departments");
  }

  return (
    <div className="space-y-6">
      <DepartmentsClient
        initialData={departments}
        createAction={createDepartmentAction}
        updateAction={updateDepartmentAction}
        deleteAction={deleteDepartmentAction}
      />
    </div>
  );
}
