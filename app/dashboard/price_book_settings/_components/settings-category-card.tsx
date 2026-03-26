"use client";

import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import type { PriceBookSetting } from "@/types/database";

interface SettingsCategoryCardProps {
  title: string;
  description: string;
  settings: PriceBookSetting[];
  onAdd: () => void;
  onEdit: (setting: PriceBookSetting) => void;
  onDelete: (id: string) => void;
}

export function SettingsCategoryCard({
  title,
  description,
  settings,
  onAdd,
  onEdit,
  onDelete,
}: SettingsCategoryCardProps) {
  const columns: ColumnDef<PriceBookSetting>[] = [
    {
      key: "key",
      label: "Key",
      sortable: true,
    },
    {
      key: "value",
      label: "Value",
      sortable: true,
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (_value: unknown, row: PriceBookSetting) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-gray-900"
            onClick={() => onEdit(row)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-red-600"
            onClick={() => onDelete(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card className="bg-white rounded-xl shadow-sm border-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            {title}
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <Button
          size="sm"
          className="bg-gray-900 text-white rounded-xl gap-1.5"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </CardHeader>
      <CardContent>
        {settings.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No entries</p>
        ) : (
          <DataTable
            columns={columns}
            data={settings}
            emptyMessage="No entries"
          />
        )}
      </CardContent>
    </Card>
  );
}
