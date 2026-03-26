// ============================================================
// Station Jet Database Types — Phase 1
// These mirror the Supabase schema. Replace with generated
// types later via: supabase gen types typescript
// ============================================================

export interface Role {
  id: string;
  name: "admin" | "manager" | "employee" | "viewer";
  description: string | null;
  permissions: Record<string, boolean>;
  created_at: string;
}

export interface Station {
  id: string;
  name: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  postal_code: string | null;
  phone: string | null;
  pos_type: string | null;
  status: "active" | "inactive" | "pending";
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  role_id: string | null;
  station_id: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  role?: Role;
  station?: Station;
}

export interface FuelGrade {
  id: string;
  station_id: string;
  name: string;
  code: string;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface FuelTank {
  id: string;
  station_id: string;
  fuel_grade_id: string;
  tank_number: string;
  capacity_litres: number;
  low_level_threshold: number;
  is_active: boolean;
  created_at: string;
  // Joined fields
  fuel_grade?: FuelGrade;
}

export interface FuelTankReading {
  id: string;
  tank_id: string;
  volume_litres: number;
  temperature_c: number | null;
  water_level_mm: number | null;
  reading_at: string;
  source: "manual" | "atg" | "import";
  created_at: string;
}

export interface StoreMetric {
  id: string;
  station_id: string;
  metric_date: string;
  sales_amount: number;
  transaction_count: number;
  items_on_hand: number;
  inventory_value: number;
  created_at: string;
}

export interface FuelSalesSummary {
  id: string;
  station_id: string;
  fuel_grade_id: string;
  summary_date: string;
  dollars_sold: number;
  units_sold: number;
  avg_price: number;
  avg_margin: number;
  gross_profit: number;
  created_at: string;
  // Joined fields
  fuel_grade?: FuelGrade;
}

export interface SystemSetting {
  id: string;
  station_id: string | null;
  key: string;
  value: unknown;
  category: string;
  created_at: string;
  updated_at: string;
}

// Tank with its latest reading — used on dashboard
export interface TankStatus {
  tank: FuelTank;
  latest_reading: FuelTankReading | null;
  fill_percentage: number;
  is_low: boolean;
}

// Dashboard store metrics summary
export interface StoreMetricsSummary {
  sales_this_month: number;
  sales_this_year: number;
  items_on_hand: number;
  inventory_value: number;
  monthly_trend: number; // percentage change vs prior month
  yearly_trend: number;  // percentage change vs prior year
}

// ============================================================
// Phase 2 — Product, Pricing & Catalog
// ============================================================

export interface Department {
  id: string;
  station_id: string;
  name: string;
  short_name: string | null;
  pcats_code: string | null;
  host_product_code: string | null;
  sales_restriction: string | null;
  taxes: string[];
  include_in_sales_report: boolean;
  include_in_shift_report: boolean;
  status: "active" | "inactive";
  sort_order: number;
  created_at: string;
  updated_at: string;
  item_count?: number;
}

export interface Subdepartment {
  id: string;
  station_id: string;
  department_id: string;
  name: string;
  gl_code: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  department?: Department;
}

export interface Supplier {
  id: string;
  station_id: string;
  name: string;
  account_number: string | null;
  primary_contact: string | null;
  phone: string | null;
  address_line1: string | null;
  city: string | null;
  country: string | null;
  province: string | null;
  postal_code: string | null;
  status: "active" | "inactive";
  is_active: boolean;
  created_at: string;
  updated_at: string;
  item_count?: number;
}

export interface Item {
  id: string;
  station_id: string;
  plu: string | null;
  upc: string | null;
  part_number: string | null;
  description: string;
  department_id: string | null;
  subdepartment_id: string | null;
  supplier_id: string | null;
  retail_price: number;
  bottle_deposit: number;
  tax_codes: string[];
  case_size: number | null;
  case_cost: number | null;
  unit_cost: number | null;
  weighted_avg_cost: number | null;
  margin: number | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  department?: Department;
  subdepartment?: Subdepartment;
  supplier?: Supplier;
}

export interface ShelfTag {
  id: string;
  station_id: string;
  item_id: string;
  unit_or_order: "EA" | "CS";
  created_at: string;
  item?: Item;
}

export interface Payout {
  id: string;
  station_id: string;
  description: string;
  french_description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PriceBookSetting {
  id: string;
  station_id: string;
  category: "payments" | "host_product_codes" | "item_locations";
  key: string;
  value: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
