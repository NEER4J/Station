"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { InventoryConfig } from "@/types/database";
import { PageHeader } from "@/components/shared/page-header";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface InventoryConfigClientProps {
  config: InventoryConfig | null;
  saveAction: (settings: Record<string, unknown>) => Promise<void>;
}

const BOOLEAN_SETTINGS = [
  {
    key: "track_inventory",
    label: "Track Inventory",
    description: "Enable inventory quantity tracking across all items",
  },
  {
    key: "auto_reorder",
    label: "Auto Reorder",
    description:
      "Automatically generate purchase orders when stock falls below threshold",
  },
  {
    key: "allow_negative_stock",
    label: "Allow Negative Stock",
    description: "Allow inventory quantities to go below zero",
  },
] as const;

export function InventoryConfigClient({
  config,
  saveAction,
}: InventoryConfigClientProps) {
  const initialSettings = config?.settings ?? {};

  const [settings, setSettings] = useState<Record<string, unknown>>(
    initialSettings,
  );
  const [isPending, startTransition] = useTransition();

  function setBooleanSetting(key: string, value: boolean) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function setStringSetting(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function setNumberSetting(key: string, value: string) {
    const num = value === "" ? null : Number(value);
    setSettings((prev) => ({ ...prev, [key]: num }));
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await saveAction(settings);
        toast.success("Settings saved");
      } catch {
        toast.error("Failed to save settings");
      }
    });
  }

  return (
    <>
      <PageHeader
        title="Inventory Control Config"
        subtitle="Configure inventory tracking and calculation rules"
      />

      {/* Business Rules Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Business Rules
          </h2>
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="bg-gray-900 text-white rounded-xl"
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>

        <div>
          {BOOLEAN_SETTINGS.map(({ key, label, description }) => (
            <div
              key={key}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div>
                <p className="font-medium text-sm">{label}</p>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
              <Checkbox
                checked={Boolean(settings[key])}
                onCheckedChange={(checked) =>
                  setBooleanSetting(key, Boolean(checked))
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* Calculation Settings Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <h2 className="text-base font-semibold text-gray-900">
          Calculation Settings
        </h2>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cost_method" className="text-sm font-medium">
              Cost Method
            </Label>
            <p className="text-xs text-gray-500">
              Inventory cost calculation method
            </p>
            <Select
              value={(settings["cost_method"] as string) ?? ""}
              onValueChange={(val) => setStringSetting("cost_method", val)}
            >
              <SelectTrigger id="cost_method">
                <SelectValue placeholder="Select cost method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fifo">FIFO</SelectItem>
                <SelectItem value="lifo">LIFO</SelectItem>
                <SelectItem value="average">Average</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="variance_threshold"
              className="text-sm font-medium"
            >
              Variance Threshold %
            </Label>
            <p className="text-xs text-gray-500">
              Alert when count variance exceeds this percentage
            </p>
            <Input
              id="variance_threshold"
              type="number"
              min={0}
              max={100}
              step={0.1}
              placeholder="e.g. 5"
              value={
                settings["variance_threshold"] != null
                  ? String(settings["variance_threshold"])
                  : ""
              }
              onChange={(e) =>
                setNumberSetting("variance_threshold", e.target.value)
              }
            />
          </div>
        </div>
      </div>
    </>
  );
}
