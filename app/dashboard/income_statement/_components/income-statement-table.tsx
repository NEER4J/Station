"use client";

import { useState } from "react";
import type { IncomeStatementRow } from "@/types/database";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmt(n: number): string {
  if (n === 0) return "—";
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n < 0 ? `(${formatted})` : formatted;
}

interface EditingCell {
  line_item: string;
  section: string;
  monthIndex: number;
}

interface IncomeStatementTableProps {
  year: number;
  rows: IncomeStatementRow[];
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

export function IncomeStatementTable({ year, rows, upsertEntryAction }: IncomeStatementTableProps) {
  const [editing, setEditing] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  function startEdit(row: IncomeStatementRow, monthIndex: number) {
    if (row.is_header || row.is_subtotal || row.section === "gross_profit") return;
    setEditing({ line_item: row.line_item, section: row.section, monthIndex });
    setEditValue(String(row.months[monthIndex] ?? 0));
  }

  async function commitEdit(row: IncomeStatementRow) {
    if (!editing) return;
    const amount = parseFloat(editValue) || 0;
    setSaving(true);
    try {
      await upsertEntryAction(year, {
        month: editing.monthIndex + 1,
        section: row.section,
        line_item: row.line_item,
        sort_order: row.sort_order,
        amount,
      });
    } finally {
      setSaving(false);
      setEditing(null);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-3 font-medium text-gray-600 w-48 min-w-[12rem]">
              Line Item
            </th>
            {MONTHS.map((m) => (
              <th key={m} className="text-right py-2 px-2 font-medium text-gray-600 min-w-[80px]">
                {m}
              </th>
            ))}
            <th className="text-right py-2 px-3 font-semibold text-gray-700 min-w-[96px]">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => {
            if (row.is_header) {
              return (
                <tr key={`header-${rowIdx}`} className="bg-gray-100">
                  <td
                    colSpan={14}
                    className="py-2 px-3 text-xs font-semibold uppercase tracking-wide text-gray-600"
                  >
                    {row.line_item}
                  </td>
                </tr>
              );
            }

            const isGrossProfit = row.section === "gross_profit" && row.is_subtotal;
            const rowClass = isGrossProfit
              ? "font-bold bg-green-50"
              : row.is_subtotal
              ? "font-semibold bg-gray-50 border-t border-gray-200"
              : "hover:bg-gray-50";

            return (
              <tr key={`${row.section}-${row.line_item}-${rowIdx}`} className={`border-b border-gray-100 ${rowClass}`}>
                <td className={`py-2 px-3 ${isGrossProfit ? "text-green-800" : "text-gray-700"}`}>
                  {row.is_subtotal ? <span className="ml-2">{row.line_item}</span> : row.line_item}
                </td>
                {row.months.map((val, mIdx) => {
                  const isEditing =
                    editing?.line_item === row.line_item &&
                    editing?.section === row.section &&
                    editing?.monthIndex === mIdx;

                  const isNegative = val < 0;
                  const cellClass = isGrossProfit
                    ? "text-green-800"
                    : isNegative
                    ? "text-red-600"
                    : "text-gray-800";

                  if (isEditing) {
                    return (
                      <td key={mIdx} className="py-1 px-2 text-right">
                        <input
                          autoFocus
                          type="number"
                          step="0.01"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => commitEdit(row)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitEdit(row);
                            if (e.key === "Escape") setEditing(null);
                          }}
                          disabled={saving}
                          className="w-20 text-right border border-blue-400 rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      </td>
                    );
                  }

                  return (
                    <td
                      key={mIdx}
                      className={`py-2 px-2 text-right tabular-nums cursor-pointer ${cellClass} ${!row.is_subtotal && !isGrossProfit ? "hover:bg-blue-50" : ""}`}
                      onClick={() => startEdit(row, mIdx)}
                    >
                      {row.is_header ? "" : fmt(val)}
                    </td>
                  );
                })}
                <td className={`py-2 px-3 text-right tabular-nums font-semibold ${isGrossProfit ? "text-green-800" : row.total < 0 ? "text-red-600" : "text-gray-900"}`}>
                  {row.is_header ? "" : fmt(row.total)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
