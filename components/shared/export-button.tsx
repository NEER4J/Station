"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportColumn {
  key: string;
  label: string;
}

interface ExportButtonProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  columns: ExportColumn[];
  filename?: string;
  className?: string;
}

function toCsv(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[],
  columns: ExportColumn[],
): string {
  const header = columns.map((c) => `"${c.label}"`).join(",");
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const val = row[col.key];
        if (val == null) return "";
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(","),
  );
  return [header, ...rows].join("\n");
}

export function ExportButton({
  data,
  columns,
  filename = "export",
  className,
}: ExportButtonProps) {
  const handleExport = () => {
    const csv = toCsv(data, columns);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={handleExport}
      disabled={data.length === 0}
    >
      <Download className="mr-1.5 h-4 w-4" />
      Export
    </Button>
  );
}
