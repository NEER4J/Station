"use client";

import type { UserWithProfile } from "@/lib/data/users";
import type { Role } from "@/types/database";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersTab } from "./users-tab";
import { RolesTab } from "./roles-tab";

interface Props {
  users: UserWithProfile[];
  roles: Role[];
  stations: { id: string; name: string }[];
  updateUserAction: (id: string, data: Record<string, unknown>) => Promise<void>;
  createRoleAction: (name: string) => Promise<void>;
  deleteRoleAction: (id: string) => Promise<void>;
}

export function UsersAdminClient({
  users,
  roles,
  stations,
  updateUserAction,
  createRoleAction,
  deleteRoleAction,
}: Props) {
  return (
    <Tabs defaultValue="users">
      <TabsList>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="roles">Roles</TabsTrigger>
      </TabsList>

      <TabsContent value="users">
        <UsersTab
          users={users}
          roles={roles}
          stations={stations}
          updateUserAction={updateUserAction}
        />
      </TabsContent>

      <TabsContent value="roles">
        <RolesTab
          roles={roles}
          createRoleAction={createRoleAction}
          deleteRoleAction={deleteRoleAction}
        />
      </TabsContent>
    </Tabs>
  );
}
