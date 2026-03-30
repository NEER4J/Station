"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { AdminOption } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OptionRow extends Partial<AdminOption> {
  _isNew?: boolean;
  _tempId?: number;
}

interface Props {
  adminOptions: AdminOption[];
  upsertOptionAction: (key: string, value: string) => Promise<void>;
  deleteOptionAction: (id: string) => Promise<void>;
}

export function OptionsTab({
  adminOptions,
  upsertOptionAction,
  deleteOptionAction,
}: Props) {
  const [rows, setRows] = useState<OptionRow[]>(adminOptions);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    setRows((prev) => [
      ...prev,
      { _isNew: true, _tempId: Date.now(), key: "", value: "" },
    ]);
  }

  function handleChange<K extends keyof OptionRow>(
    identifier: string | number,
    field: K,
    value: OptionRow[K],
  ) {
    setRows((prev) =>
      prev.map((r) => {
        const key = r._isNew ? r._tempId : r.id;
        if (key === identifier) return { ...r, [field]: value };
        return r;
      }),
    );
  }

  function handleSave(row: OptionRow) {
    startTransition(async () => {
      try {
        await upsertOptionAction(row.key ?? "", row.value ?? "");
        toast.success("Option saved");
      } catch {
        toast.error("Failed to save option");
      }
    });
  }

  function handleRemove(row: OptionRow) {
    if (row._isNew) {
      setRows((prev) => prev.filter((r) => r._tempId !== row._tempId));
      return;
    }
    startTransition(async () => {
      try {
        await deleteOptionAction(row.id!);
        setRows((prev) => prev.filter((r) => r.id !== row.id));
        toast.success("Option removed");
      } catch {
        toast.error("Failed to remove option");
      }
    });
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">System Options</h2>
        <Button
          onClick={handleAdd}
          className="bg-gray-900 text-white rounded-xl"
        >
          + Add Option
        </Button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left pb-3 font-medium text-gray-600">Key</th>
            <th className="text-left pb-3 font-medium text-gray-600">Value</th>
            <th className="pb-3 w-24"></th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={3}
                className="py-8 text-center text-sm text-gray-400"
              >
                No options defined. Click "+ Add Option" to create one.
              </td>
            </tr>
          )}
          {rows.map((row) => {
            const identifier = row._isNew ? row._tempId! : row.id!;
            return (
              <tr key={identifier} className="border-b border-gray-50">
                <td className="py-2 pr-3">
                  <Input
                    value={row.key ?? ""}
                    onChange={(e) =>
                      handleChange(identifier, "key", e.target.value)
                    }
                    className="h-8 bg-gray-50 border-0"
                    placeholder="option_key"
                  />
                </td>
                <td className="py-2 pr-3">
                  <Input
                    value={row.value ?? ""}
                    onChange={(e) =>
                      handleChange(identifier, "value", e.target.value)
                    }
                    className="h-8 bg-gray-50 border-0"
                    placeholder="value"
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
