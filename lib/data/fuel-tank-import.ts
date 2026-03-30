import { createClient } from "@/lib/supabase/server";
import type { ParsedDipRow } from "@/types/database";

export async function importFuelTankReadings(
  stationId: string,
  rows: ParsedDipRow[],
): Promise<{ inserted: number; skipped: number }> {
  const supabase = await createClient();

  // Fetch all tanks for this station to map tank_no → tank id
  const { data: tanks, error: tankError } = await supabase
    .from("fuel_tanks")
    .select("id, tank_number")
    .eq("station_id", stationId);
  if (tankError) throw tankError;

  const tankMap = new Map<string, string>();
  for (const t of tanks ?? []) {
    tankMap.set(t.tank_number, t.id);
  }

  const readings: {
    tank_id: string;
    volume_litres: number;
    temperature_c: number | null;
    water_level_mm: number | null;
    reading_at: string;
    source: string;
    metadata: Record<string, unknown>;
  }[] = [];

  let skipped = 0;

  for (const row of rows) {
    const tankId = tankMap.get(row.tank_no);
    if (!tankId) {
      skipped++;
      continue;
    }

    const dateStr = `${row.date}T${row.time || "00:00:00"}`;
    readings.push({
      tank_id: tankId,
      volume_litres: row.litres_tc,
      temperature_c: row.temp ?? null,
      water_level_mm: row.water ?? null,
      reading_at: dateStr,
      source: "import",
      metadata: {
        litres_gross: row.litres_gross,
        ullage: row.ullage,
        dip: row.dip,
        product: row.product,
        site_id: row.site_id,
      },
    });
  }

  if (readings.length === 0) return { inserted: 0, skipped };

  const { error } = await supabase.from("fuel_tank_readings").insert(readings);
  if (error) throw error;

  return { inserted: readings.length, skipped };
}
