import {
  LayoutDashboard,
  LineChart,
  Database,
  Users,
  MessageSquare,
  Palette,
  CreditCard,
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
    label: "Station",
    items: [
      {
        title: "Overview",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Sales & profit",
        url: "/dashboard/reports",
        icon: LineChart,
        subItems: [
          {
            title: "All reports",
            url: "/dashboard/reports",
          },
          {
            title: "New report",
            url: "/dashboard/reports/create",
          },
          {
            title: "Templates",
            url: "/dashboard/reports/templates",
          },
        ],
      },
      {
        title: "Inventory",
        url: "/dashboard/data",
        icon: Database,
        subItems: [
          {
            title: "Connections",
            url: "/dashboard/data/connections",
          },
          {
            title: "CSV uploads",
            url: "/dashboard/data/uploads",
          },
          {
            title: "Sync logs",
            url: "/dashboard/data/sync-logs",
          },
        ],
      },
      {
        title: "Accounts",
        url: "/dashboard/clients",
        icon: Users,
        subItems: [
          {
            title: "Account list",
            url: "/dashboard/clients",
          },
          {
            title: "Shareable links",
            url: "/dashboard/clients/shareable-links",
          },
        ],
      },
      {
        title: "Messages",
        url: "/dashboard/chat",
        icon: MessageSquare,
      },
      {
        title: "Station appearance",
        url: "/dashboard/branding",
        icon: Palette,
      },
      {
        title: "Billing",
        url: "/dashboard/billing",
        icon: CreditCard,
      },
    ],
  },
];
