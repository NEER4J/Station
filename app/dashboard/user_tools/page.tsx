import { createClient } from "@/lib/supabase/server";
import { UserToolsClient } from "./_components/user-tools-client";

export default async function UserToolsPage() {
  const supabase = await createClient();
  await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      <UserToolsClient />
    </div>
  );
}
