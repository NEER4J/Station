"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SettingsCategoryCard } from "./_components/settings-category-card";
import { PriceBookSettingFormDialog } from "./_components/price-book-setting-form-dialog";
import type { PriceBookSetting } from "@/types/database";
import type { PriceBookSettingFormData } from "@/lib/validations/price-book-settings";

interface PriceBookSettingsClientProps {
  payments: PriceBookSetting[];
  hostProductCodes: PriceBookSetting[];
  itemLocations: PriceBookSetting[];
  upsertAction: (data: PriceBookSettingFormData, existingId?: string) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
}

export function PriceBookSettingsClient({
  payments,
  hostProductCodes,
  itemLocations,
  upsertAction,
  deleteAction,
}: PriceBookSettingsClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("payments");
  const [editingSetting, setEditingSetting] = useState<PriceBookSetting | undefined>();

  const handleAdd = (category: string) => {
    setActiveCategory(category);
    setEditingSetting(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (setting: PriceBookSetting) => {
    setActiveCategory(setting.category);
    setEditingSetting(setting);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAction(id);
      toast.success("Setting deleted");
    } catch {
      toast.error("Failed to delete setting");
    }
  };

  const handleSubmit = async (data: PriceBookSettingFormData) => {
    try {
      await upsertAction(data, editingSetting?.id);
      toast.success(editingSetting ? "Setting updated" : "Setting created");
    } catch {
      toast.error("Failed to save setting");
    }
  };

  return (
    <>
      <div className="space-y-6">
        <SettingsCategoryCard
          title="Payments"
          description="Configure accepted payment methods"
          settings={payments}
          onAdd={() => handleAdd("payments")}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <SettingsCategoryCard
          title="Host Product Codes"
          description="Map internal inventory to external codes"
          settings={hostProductCodes}
          onAdd={() => handleAdd("host_product_codes")}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <SettingsCategoryCard
          title="Item Locations"
          description="Define physical item placement areas"
          settings={itemLocations}
          onAdd={() => handleAdd("item_locations")}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <PriceBookSettingFormDialog
        key={editingSetting?.id ?? activeCategory}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        setting={editingSetting}
        category={activeCategory}
        onSubmit={handleSubmit}
      />
    </>
  );
}
