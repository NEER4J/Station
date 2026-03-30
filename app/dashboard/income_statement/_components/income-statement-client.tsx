"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { YearSelector } from "./year-selector";
import { IncomeStatementTable } from "./income-statement-table";
import type { IncomeStatementRow } from "@/types/database";

interface IncomeStatementClientProps {
  year: number;
  rows: IncomeStatementRow[];
  generateAction: (year: number) => Promise<void>;
  upsertEntryAction: (
    year: number,
    entry: {
      month: number;
      section: string;
      line_item: string;
      sort_order: number;
      amount: number;
    },
  ) => Promise<void>;
}

export function IncomeStatementClient({
  year,
  rows,
  generateAction,
  upsertEntryAction,
}: IncomeStatementClientProps) {
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    startTransition(async () => {
      await generateAction(year);
    });
  }

  const hasData = rows.some((r) => !r.is_header && !r.is_subtotal);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Fiscal Year</span>
          <YearSelector year={year} />
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isPending}
          className="bg-gray-900 text-white rounded-xl hover:bg-gray-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isPending ? "animate-spin" : ""}`} />
          {isPending ? "Generating…" : "Generate from Data"}
        </Button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {!hasData ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            No data for {year}. Click &ldquo;Generate from Data&rdquo; to populate from transactions.
          </div>
        ) : (
          <IncomeStatementTable
            year={year}
            rows={rows}
            upsertEntryAction={upsertEntryAction}
          />
        )}
      </div>
    </div>
  );
}
