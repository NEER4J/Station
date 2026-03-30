import { createClient } from "@/lib/supabase/server";
import type { BatchPost } from "@/types/database";

export async function getBatchPosts(stationId: string): Promise<BatchPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("batch_posts")
    .select("*")
    .eq("station_id", stationId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
