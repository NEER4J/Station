"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/use-auth";
import { hasMinimumRole, ROLES, type RoleName } from "@/lib/auth/roles";

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<RoleName | null>(null);
  const [stationId, setStationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const fetchRole = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("user_profiles")
        .select("station_id, role:roles(name)")
        .eq("id", user.id)
        .single();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const roleName = (data as any)?.role?.name as RoleName | undefined;
      setRole(roleName ?? null);
      setStationId(data?.station_id ?? null);
      setIsLoading(false);
    };

    fetchRole();
  }, [user?.id]);

  return {
    role,
    stationId,
    isLoading,
    isAdmin: hasMinimumRole(role, ROLES.ADMIN),
    isManager: hasMinimumRole(role, ROLES.MANAGER),
    canViewFinancials: hasMinimumRole(role, ROLES.MANAGER),
    canExport: hasMinimumRole(role, ROLES.EMPLOYEE),
  };
}
