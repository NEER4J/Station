"use client";

import { useState } from "react";
import type { SiteWithDetails } from "@/lib/data/site-details";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface Props {
  data: SiteWithDetails[];
  onEdit: (site: SiteWithDetails) => void;
}

export function SitesTable({ data, onEdit }: Props) {
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");

  function handleSort(key: string) {
    if (sortBy === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDirection("asc");
    }
  }

  const filtered = data.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const sorted = [...filtered].sort((a, b) => {
    const aVal = (a as unknown as Record<string, unknown>)[sortBy];
    const bVal = (b as unknown as Record<string, unknown>)[sortBy];
    const aStr = aVal != null ? String(aVal) : "";
    const bStr = bVal != null ? String(bVal) : "";
    return sortDirection === "asc"
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });

  const columns: ColumnDef<SiteWithDetails>[] = [
    {
      key: "site_code",
      label: "Site Code",
      className: "font-mono text-xs",
      render: (_val, row) => {
        const s = row as unknown as SiteWithDetails;
        return s.details?.site_code || "\u2014";
      },
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
    },
    {
      key: "location",
      label: "Location",
      render: (_val, row) => {
        const s = row as unknown as SiteWithDetails;
        return (
          `${s.city || ""}${s.city && s.province ? ", " : ""}${s.province || ""}`.trim() ||
          "\u2014"
        );
      },
    },
    {
      key: "pos_type",
      label: "POS Type",
      render: (val) => (val as string) || "\u2014",
    },
    {
      key: "pending_changes",
      label: "Pending",
      render: (_val, row) => {
        const s = row as unknown as SiteWithDetails;
        const count = s.details?.pending_changes ?? 0;
        return count > 0 ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            {count}
          </span>
        ) : (
          <span className="text-gray-400">0</span>
        );
      },
    },
    {
      key: "sftp",
      label: "SFTP",
      align: "center",
      render: (_val, row) => {
        const s = row as unknown as SiteWithDetails;
        return (
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${s.details?.sftp_enabled ? "bg-green-500" : "bg-gray-300"}`}
          />
        );
      },
    },
    {
      key: "realtime",
      label: "Realtime",
      align: "center",
      render: (_val, row) => {
        const s = row as unknown as SiteWithDetails;
        return (
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${s.details?.realtime_enabled ? "bg-green-500" : "bg-gray-300"}`}
          />
        );
      },
    },
    {
      key: "last_heartbeat",
      label: "Last Heartbeat",
      render: (_val, row) => {
        const s = row as unknown as SiteWithDetails;
        return s.details?.last_heartbeat_at
          ? new Date(s.details.last_heartbeat_at).toLocaleString()
          : "\u2014";
      },
    },
    {
      key: "actions",
      label: "",
      render: (_val, row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(row as unknown as SiteWithDetails)}
          className="h-8 w-8 p-0"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-64 rounded-lg border border-gray-200 bg-gray-100 px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>
      <DataTable<SiteWithDetails>
        columns={columns}
        data={sorted}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        emptyMessage="No sites found."
      />
    </div>
  );
}
