import {
  LayoutDashboard,
  Settings,
  Package,
  Tag,
  Wallet,
  Building2,
  Layers,
  Megaphone,
  TicketPercent,
  Receipt,
  ShoppingCart,
  ClipboardMinus,
  ArrowLeftRight,
  ClipboardCheck,
  FileStack,
  Droplets,
  Upload,
  FileJson,
  ShieldCheck,
  Map,
  Store,
  Users,
  Truck,
  Wrench,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Foundations",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 2,
    label: "Product & Price Book",
    items: [
      {
        title: "Items",
        url: "/dashboard/Items",
        icon: Package,
      },
      {
        title: "Shelf Tag Report",
        url: "/dashboard/shelf_tags",
        icon: Tag,
      },
      {
        title: "Payouts",
        url: "/dashboard/payouts",
        icon: Wallet,
      },
      {
        title: "Departments",
        url: "/dashboard/departments",
        icon: Building2,
      },
      {
        title: "Subdepartments",
        url: "/dashboard/subdepartments",
        icon: Layers,
      },
      {
        title: "Suppliers",
        url: "/dashboard/suppliers",
        icon: Truck,
      },
      {
        title: "Price Book Settings",
        url: "/dashboard/price_book_settings",
        icon: Settings,
      },
      {
        title: "BT9000 Import",
        url: "/dashboard/bt9000_import",
        icon: Upload,
        isNew: true,
      },
    ],
  },
  {
    id: 3,
    label: "Operations & Fuel",
    items: [
      {
        title: "Promotion Management",
        url: "/dashboard/item_lists",
        icon: Megaphone,
        subItems: [
          {
            title: "Item Lists",
            url: "/dashboard/item_lists",
          },
          {
            title: "Price Groups",
            url: "/dashboard/price_groups",
          },
          {
            title: "Deal Groups",
            url: "/dashboard/deal_groups",
          },
          {
            title: "Tender Coupons",
            url: "/dashboard/tender_coupons",
          },
          {
            title: "Batch Promotions",
            url: "/dashboard/batch_promotions",
          },
          {
            title: "Liquor Imports",
            url: "/dashboard/liquor_imports",
          },
        ],
      },
      {
        title: "Purchase Orders",
        url: "/dashboard/purchase_orders",
        icon: ShoppingCart,
      },
      {
        title: "Item Write-Off",
        url: "/dashboard/item_write_offs",
        icon: ClipboardMinus,
      },
      {
        title: "Item Transfer Order",
        url: "/dashboard/item_transfer_orders",
        icon: ArrowLeftRight,
      },
      {
        title: "Physical Counts",
        url: "/dashboard/inventory_counts",
        icon: ClipboardCheck,
      },
      {
        title: "Batch Posts",
        url: "/dashboard/batch_posts",
        icon: FileStack,
      },
      {
        title: "Inventory Control Config",
        url: "/dashboard/inventory_config",
        icon: Wrench,
      },
      {
        title: "Fuel Management",
        url: "/dashboard/fuel_config",
        icon: Droplets,
        subItems: [
          {
            title: "Fuel Configuration",
            url: "/dashboard/fuel_config",
          },
          {
            title: "Fuel Tank Import",
            url: "/dashboard/fuel_tank_import",
          },
          {
            title: "Pump Report Import",
            url: "/dashboard/pump_report_import",
            icon: FileJson,
            isNew: true,
          },
        ],
      },
    ],
  },
  {
    id: 4,
    label: "Admin & Finance",
    items: [
      {
        title: "General Administration",
        url: "/dashboard/administration/general",
        icon: ShieldCheck,
      },
      {
        title: "Regions",
        url: "/dashboard/administration/regions",
        icon: Map,
      },
      {
        title: "Sites",
        url: "/dashboard/administration/sites",
        icon: Store,
      },
      {
        title: "User Administration",
        url: "/dashboard/administration/users",
        icon: Users,
      },
      {
        title: "Vendors",
        url: "/dashboard/administration/vendors",
        icon: Truck,
      },
      {
        title: "User Tools",
        url: "/dashboard/user_tools",
        icon: Upload,
      },
      {
        title: "Daily Reconciliations",
        url: "/dashboard/daily_reconciliations",
        icon: Receipt,
      },
      {
        title: "Income Statement",
        url: "/dashboard/income_statement",
        icon: BarChart3,
      },
    ],
  },
];
