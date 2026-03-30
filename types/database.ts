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

// ============================================================
// Phase 3 — Promotions, Inventory Operations & Fuel
// ============================================================

export interface ItemList {
  id: string;
  station_id: string;
  description: string;
  status: "active" | "inactive";
  sort_order: number;
  created_at: string;
  updated_at: string;
  deal_group_count?: number;
}

export interface PriceGroup {
  id: string;
  station_id: string;
  description: string;
  availability: string | null;
  unit_price: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  item_count?: number;
}

export interface DealGroup {
  id: string;
  station_id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  availability: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  component_count?: number;
}

export interface DealGroupComponent {
  id: string;
  deal_group_id: string;
  description: string;
  component_type: string | null;
  amount: number | null;
  created_at: string;
}

export interface TenderCoupon {
  id: string;
  station_id: string;
  description: string;
  type_of_discount: "fixed" | "percentage" | "amount_off";
  amount: number;
  prompt_for_amount: boolean;
  max_per_customer: number;
  available_always: boolean;
  start_date: string | null;
  end_date: string | null;
  is_disabled: boolean;
  upc: string | null;
  created_at: string;
  updated_at: string;
}

export interface BatchPromotion {
  id: string;
  station_id: string;
  promotion_price: number;
  comments: string | null;
  start_date: string;
  end_date: string;
  status: "draft" | "active" | "expired";
  created_at: string;
  updated_at: string;
  item_count?: number;
}

export interface LiquorImport {
  id: string;
  station_id: string;
  is_regular: boolean;
  lto_start_date: string | null;
  lto_end_date: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  item_count: number;
  matched_count: number;
  imported_at: string;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  station_id: string;
  supplier_id: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  expected_date: string | null;
  received_date: string | null;
  status: "draft" | "submitted" | "received" | "cancelled";
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
}

export interface ItemWriteOff {
  id: string;
  station_id: string;
  status: "draft" | "posted";
  total_amount: number;
  posted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItemTransferOrder {
  id: string;
  station_id: string;
  source_site: string | null;
  destination_site: string | null;
  status: "draft" | "submitted" | "received" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface InventoryCount {
  id: string;
  station_id: string;
  status: "draft" | "counting" | "posted";
  counted_at: string | null;
  posted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BatchPost {
  id: string;
  station_id: string;
  type: string;
  reference_id: string | null;
  reference_type: string | null;
  status: "pending" | "completed" | "failed";
  posted_at: string | null;
  created_at: string;
}

export interface InventoryConfig {
  id: string;
  station_id: string;
  settings: Record<string, unknown>;
  updated_at: string;
}

export interface ParsedDipRow {
  site_id: string;
  date: string;
  time: string;
  tank_no: string;
  product: string;
  litres_tc: number;
  litres_gross: number;
  ullage: number;
  dip: number;
  water: number;
  temp: number;
}

// ============================================================
// Phase 4 — Administration, Access & Operational Control
// ============================================================

export interface Tax {
  id: string;
  station_id: string;
  name: string;
  percentage: number;
  use_in_po: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AdminOption {
  id: string;
  station_id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface Region {
  id: string;
  name: string;
  category: string | null;
  created_at: string;
  updated_at: string;
  site_count?: number;
}

export interface SiteDetail {
  id: string;
  station_id: string;
  site_code: string | null;
  pending_changes: number;
  sftp_enabled: boolean;
  realtime_enabled: boolean;
  last_sync_at: string | null;
  last_heartbeat_at: string | null;
  connectivity_notes: string | null;
  updated_at: string;
}

export interface Vendor {
  id: string;
  station_id: string;
  vendor_code: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface DailyReconciliation {
  id: string;
  station_id: string;
  report_date: string;
  shift_count: number;
  status: "pending" | "reconciled" | "approved";
  fuel_volume: number;
  fuel_sales: number;
  store_sales: number;
  other_sales: number;
  taxes: number;
  non_cash_tender: number;
  deposits: number;
  payouts: number;
  over_short_volume: number;
  over_short_dollars: number;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Phase 5 — Financial Management
// ============================================================

export interface IncomeStatementEntry {
  id: string;
  station_id: string;
  fiscal_year: number;
  month: number;
  section: string;
  line_item: string;
  sort_order: number;
  amount: number;
  is_override: boolean;
  created_at: string;
  updated_at: string;
}

// Computed display shape — one row per line_item with 12 monthly amounts
export interface IncomeStatementRow {
  section: string;
  line_item: string;
  sort_order: number;
  months: number[]; // index 0 = Jan … 11 = Dec
  total: number;
  is_subtotal?: boolean;
  is_header?: boolean;
}
