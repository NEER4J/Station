import { createClient } from "@/lib/supabase/server";
import type { FuelGrade, FuelTank } from "@/types/database";

// ---- Fuel Grades (Products) ----

export async function getFuelGrades(stationId: string): Promise<FuelGrade[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fuel_grades")
    .select("*")
    .eq("station_id", stationId)
    .order("sort_order")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function createFuelGrade(
  stationId: string,
  data: Partial<FuelGrade>,
): Promise<FuelGrade> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("fuel_grades")
    .insert({ ...data, station_id: stationId })
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updateFuelGrade(
  id: string,
  data: Partial<FuelGrade>,
): Promise<FuelGrade> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("fuel_grades")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function deleteFuelGrade(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("fuel_grades").delete().eq("id", id);
  if (error) throw error;
}

// ---- Fuel Tanks ----

export async function getFuelTanks(stationId: string): Promise<FuelTank[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fuel_tanks")
    .select("*, fuel_grade:fuel_grades(id, name, code, color)")
    .eq("station_id", stationId)
    .order("tank_number");
  if (error) throw error;
  return (data ?? []) as FuelTank[];
}

export async function createFuelTank(
  stationId: string,
  data: Partial<FuelTank>,
): Promise<FuelTank> {
  const supabase = await createClient();
  const { fuel_grade: _fg, ...insertData } = data as FuelTank;
  const { data: result, error } = await supabase
    .from("fuel_tanks")
    .insert({ ...insertData, station_id: stationId })
    .select("*, fuel_grade:fuel_grades(id, name, code, color)")
    .single();
  if (error) throw error;
  return result as FuelTank;
}

export async function updateFuelTank(
  id: string,
  data: Partial<FuelTank>,
): Promise<FuelTank> {
  const supabase = await createClient();
  const { fuel_grade: _fg, ...updateData } = data as FuelTank;
  const { data: result, error } = await supabase
    .from("fuel_tanks")
    .update(updateData)
    .eq("id", id)
    .select("*, fuel_grade:fuel_grades(id, name, code, color)")
    .single();
  if (error) throw error;
  return result as FuelTank;
}

export async function deleteFuelTank(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("fuel_tanks").delete().eq("id", id);
  if (error) throw error;
}
