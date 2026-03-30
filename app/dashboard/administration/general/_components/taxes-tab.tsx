"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { Tax } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface TaxRow extends Partial<Tax> {
  _isNew?: boolean;
  _tempId?: number;
}

interface Props {
  taxes: Tax[];
  createTaxAction: (data: Record<string, unknown>) => Promise<void>;
  updateTaxAction: (id: string, data: Record<string, unknown>) => Promise<void>;
  deleteTaxAction: (id: string) => Promise<void>;
}

export function TaxesTab({
  taxes,
  createTaxAction,
  updateTaxAction,
  deleteTaxAction,
}: Props) {
  const [rows, setRows] = useState<TaxRow[]>(taxes);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    setRows((prev) => [
      ...prev,
      { _isNew: true, _tempId: Date.now(), name: "", percentage: 0, use_in_po: false },
    ]);
  }

  function handleChange<K extends keyof TaxRow>(
    identifier: string | number,
    field: K,
    value: TaxRow[K],
  ) {
    setRows((prev) =>
      prev.map((r) => {
        const key = r._isNew ? r._tempId : r.id;
        if (key === identifier) return { ...r, [field]: value };
        return r;
      }),
    );
  }

  function handleSave(row: TaxRow) {
    startTransition(async () => {
      try {
        const payload = {
          name: row.name ?? "",
          percentage: row.percentage ?? 0,
          use_in_po: row.use_in_po ?? false,
        };

        if (row._isNew) {
          await createTaxAction(payload);
          toast.success("Tax created");
        } else {
          await updateTaxAction(row.id!, payload);
          toast.success("Tax updated");
        }
      } catch {
        toast.error("Failed to save tax");
      }
    });
  }

  function handleRemove(row: TaxRow) {
    if (row._isNew) {
      setRows((prev) => prev.filter((r) => r._tempId !== row._tempId));
      return;
    }
    startTransition(async () => {
      try {
        await deleteTaxAction(row.id!);
        setRows((prev) => prev.filter((r) => r.id !== row.id));
        toast.success("Tax removed");
      } catch {
        toast.error("Failed to remove tax");
      }
    });
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Tax Definitions</h2>
        <Button
          onClick={handleAdd}
          className="bg-gray-900 text-white rounded-xl"
        >
          + Add Tax
        </Button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left pb-3 font-medium text-gray-600">Name</th>
            <th className="text-left pb-3 font-medium text-gray-600">
              Rate (%)
            </th>
            <th className="text-left pb-3 font-medium text-gray-600">
              Use in PO
            </th>
            <th className="pb-3 w-24"></th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="py-8 text-center text-sm text-gray-400"
              >
                No taxes defined. Click "+ Add Tax" to create one.
              </td>
            </tr>
          )}
          {rows.map((row) => {
            const key = row._isNew ? row._tempId! : row.id!;
            return (
              <tr key={key} className="border-b border-gray-50">
                <td className="py-2 pr-3">
                  <Input
                    value={row.name ?? ""}
                    onChange={(e) => handleChange(key, "name", e.target.value)}
                    className="h-8 bg-gray-50 border-0"
                    placeholder="Tax name"
                  />
                </td>
                <td className="py-2 pr-3 w-28">
                  <Input
                    type="number"
                    value={row.percentage ?? 0}
                    onChange={(e) =>
                      handleChange(key, "percentage", parseFloat(e.target.value) || 0)
                    }
                    className="h-8 bg-gray-50 border-0"
                    placeholder="0.00"
                  />
                </td>
                <td className="py-2 pr-3">
                  <Checkbox
                    checked={row.use_in_po ?? false}
                    onCheckedChange={(checked) =>
                      handleChange(key, "use_in_po", checked === true)
                    }
                  />
                </td>
                <td className="py-2">
                  <div className="flex gap-1 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSave(row)}
                      disabled={isPending}
                      className="h-7 px-2 text-xs"
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemove(row)}
                      disabled={isPending}
                      className="h-7 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
