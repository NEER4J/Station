import { createClient } from "@/lib/supabase/server";
import { hasMinimumRole, type RoleName } from "@/lib/auth/roles";

interface RoleGateProps {
  minimumRole: RoleName;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export async function RoleGate({
  minimumRole,
  children,
  fallback = null,
}: RoleGateProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <>{fallback}</>;

  const { data } = await supabase
    .from("user_profiles")
    .select("role:roles(name)")
    .eq("id", user.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roleName = (data as any)?.role?.name as RoleName | undefined;

  if (!hasMinimumRole(roleName ?? null, minimumRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
