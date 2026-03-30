import { createClient } from "@/lib/supabase/server";
import { listUsers, getRoles } from "@/lib/data/users";
import { PageHeader } from "@/components/shared/page-header";
import { UsersAdminClient } from "./_components/users-admin-client";

export default async function UsersAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [users, roles] = await Promise.all([
    listUsers().catch(() => []),
    getRoles().catch(() => []),
  ]);

  const { data: stationsData } = await supabase
    .from("stations")
    .select("id, name")
    .order("name");
  const stations = (stationsData ?? []) as { id: string; name: string }[];

  async function updateUserProfileAction(
    id: string,
    data: Record<string, unknown>,
  ) {
    "use server";
    const { updateUserProfile } = await import("@/lib/data/users");
    const { revalidatePath } = await import("next/cache");

    await updateUserProfile(id, data);
    revalidatePath("/dashboard/administration/users");
  }

  async function createRoleAction(name: string) {
    "use server";
    const { createRole } = await import("@/lib/data/users");
    const { revalidatePath } = await import("next/cache");

    await createRole(name);
    revalidatePath("/dashboard/administration/users");
  }

  async function deleteRoleAction(id: string) {
    "use server";
    const { deleteRole } = await import("@/lib/data/users");
    const { revalidatePath } = await import("next/cache");

    await deleteRole(id);
    revalidatePath("/dashboard/administration/users");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Administration"
        subtitle="Manage users, roles and access permissions"
        backHref="/dashboard"
      />
      <UsersAdminClient
        users={users}
        roles={roles}
        stations={stations}
        updateUserAction={updateUserProfileAction}
        createRoleAction={createRoleAction}
        deleteRoleAction={deleteRoleAction}
      />
    </div>
  );
}
