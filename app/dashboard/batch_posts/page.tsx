import { createClient } from "@/lib/supabase/server";
import { getBatchPosts } from "@/lib/data/batch-posts";
import { BatchPostsClient } from "./_components/batch-posts-client";

export default async function BatchPostsPage() {
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

  const batchPosts = stationId
    ? await getBatchPosts(stationId).catch(() => [])
    : [];

  return (
    <div className="space-y-6">
      <BatchPostsClient initialData={batchPosts} />
    </div>
  );
}
