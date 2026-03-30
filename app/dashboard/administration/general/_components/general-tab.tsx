"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { Station } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  station: Station | null;
  updateStationAction: (data: Record<string, unknown>) => Promise<void>;
}

export function GeneralTab({ station, updateStationAction }: Props) {
  const [isPending, startTransition] = useTransition();

  const [formState, setFormState] = useState({
    name: station?.name ?? "",
    address_line1: station?.address_line1 ?? "",
    city: station?.city ?? "",
    province: station?.province ?? "",
    country: station?.country ?? "",
    postal_code: station?.postal_code ?? "",
    phone: station?.phone ?? "",
    pos_type: station?.pos_type ?? "",
    status: station?.status ?? "active",
  });

  function handleChange(field: keyof typeof formState, value: string) {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await updateStationAction(formState);
        toast.success("Station updated");
      } catch {
        toast.error("Failed to update station");
      }
    });
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Station Information
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Update your station's core details
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isPending}
          className="bg-gray-900 text-white rounded-xl"
        >
          {isPending ? "Saving…" : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formState.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address_line1">Address</Label>
          <Input
            id="address_line1"
            value={formState.address_line1}
            onChange={(e) => handleChange("address_line1", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formState.city}
            onChange={(e) => handleChange("city", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="province">Province</Label>
          <Input
            id="province"
            value={formState.province}
            onChange={(e) => handleChange("province", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={formState.country}
            onChange={(e) => handleChange("country", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="postal_code">Postal Code</Label>
          <Input
            id="postal_code"
            value={formState.postal_code}
            onChange={(e) => handleChange("postal_code", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formState.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pos_type">POS Type</Label>
          <Input
            id="pos_type"
            value={formState.pos_type}
            onChange={(e) => handleChange("pos_type", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formState.status}
            onValueChange={(v) => handleChange("status", v)}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
