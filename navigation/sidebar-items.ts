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
        comingSoon: true,
        subItems: [
          {
            title: "Item Lists",
            url: "/dashboard/item_lists",
            comingSoon: true,
          },
          {
            title: "Price Groups",
            url: "/dashboard/price_groups",
            comingSoon: true,
          },
          {
            title: "Deal Groups",
            url: "/dashboard/deal_groups",
            comingSoon: true,
          },
          {
            title: "Tender Coupons",
            url: "/dashboard/tender_coupons",
            comingSoon: true,
          },
          {
            title: "Batch Promotions",
            url: "/dashboard/batch_promotions",
            comingSoon: true,
          },
          {
            title: "Liquor Imports",
            url: "/dashboard/liquor_imports",
            comingSoon: true,
          },
        ],
      },
      {
        title: "Purchase Orders",
        url: "/dashboard/purchase_orders",
        icon: ShoppingCart,
        comingSoon: true,
      },
      {
        title: "Item Write-Off",
        url: "/dashboard/item_write_offs",
        icon: ClipboardMinus,
        comingSoon: true,
      },
      {
        title: "Item Transfer Order",
        url: "/dashboard/item_transfer_orders",
        icon: ArrowLeftRight,
        comingSoon: true,
      },
      {
        title: "Physical Counts",
        url: "/dashboard/inventory_counts",
        icon: ClipboardCheck,
        comingSoon: true,
      },
      {
        title: "Batch Posts",
        url: "/dashboard/batch_posts",
        icon: FileStack,
        comingSoon: true,
      },
      {
        title: "Inventory Control Config",
        url: "/dashboard/inventory_config",
        icon: Wrench,
        comingSoon: true,
      },
      {
        title: "Fuel Management",
        url: "/dashboard/fuel_config",
        icon: Droplets,
        comingSoon: true,
        subItems: [
          {
            title: "Fuel Configuration",
            url: "/dashboard/fuel_config",
            comingSoon: true,
          },
          {
            title: "Fuel Tank Import",
            url: "/dashboard/fuel_tank_import",
            comingSoon: true,
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
        comingSoon: true,
      },
      {
        title: "Regions",
        url: "/dashboard/administration/regions",
        icon: Map,
        comingSoon: true,
      },
      {
        title: "Sites",
        url: "/dashboard/administration/sites",
        icon: Store,
        comingSoon: true,
      },
      {
        title: "User Administration",
        url: "/dashboard/administration/users",
        icon: Users,
        comingSoon: true,
      },
      {
        title: "Vendors",
        url: "/dashboard/administration/vendors",
        icon: Truck,
        comingSoon: true,
      },
      {
        title: "User Tools",
        url: "/dashboard/user_tools",
        icon: Upload,
        comingSoon: true,
      },
      {
        title: "Daily Reconciliations",
        url: "/dashboard/daily_reconciliations",
        icon: Receipt,
        comingSoon: true,
      },
      {
        title: "Income Statement",
        url: "/dashboard/income_statement",
        icon: BarChart3,
        comingSoon: true,
      },
    ],
  },
];
