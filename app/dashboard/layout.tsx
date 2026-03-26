import { ReactNode } from "react";

import { cookies } from "next/headers";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { SearchDialog } from "@/components/sidebar/search-dialog";
import { StationProvider } from "@/lib/auth/station-context";
import type { RoleName } from "@/lib/auth/roles";

export default async function Layout({ children }: Readonly<{ children: ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  // Fetch user profile with role and station
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*, role:roles(name), station:stations(id, name)")
    .eq("id", user.id)
    .single();

  // Transform user data for the sidebar
  const userData = {
    id: user.id,
    name: profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    avatar: profile?.avatar_url || user.user_metadata?.avatar_url || '',
    role: user.user_metadata?.role || 'user'
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roleName = (profile?.role as any)?.name as RoleName | null ?? null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const station = profile?.station as any;

  return (
    <StationProvider
      value={{
        stationId: station?.id ?? null,
        stationName: station?.name ?? null,
        userRole: roleName,
      }}
    >
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar
          variant="sidebar"
          collapsible="icon"
          user={{
            name: userData.name,
            email: userData.email,
            avatar: userData.avatar,
          }}
        />
        <SidebarInset
          className={cn(
            "max-w-full",
          )}
        >
          <header
            className={cn(
              "flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear",
              "sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm",
            )}
          >
            <div className="flex w-full items-center justify-between px-4 lg:px-6">
              <div className="flex items-center gap-1 lg:gap-2">
                <SidebarTrigger className="-ml-1" />
                <SearchDialog />
              </div>
            </div>
          </header>
          <div className="h-full p-4 md:p-6 bg-gray-100">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </StationProvider>
  );
}
