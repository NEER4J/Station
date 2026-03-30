"use client";

import { useEffect, useState } from "react";
import type { FuelGrade, FuelTank } from "@/types/database";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FuelTankFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tank?: FuelTank;
  fuelGrades: FuelGrade[];
  onSubmit: (data: Record<string, unknown>) => void;
}

const DEFAULT_FORM = {
  tank_number: "",
  fuel_grade_id: "",
  capacity_litres: 0,
  low_level_threshold: 0,
  is_active: true,
};

export function FuelTankFormDialog({
  open,
  onOpenChange,
  tank,
  fuelGrades,
  onSubmit,
}: FuelTankFormDialogProps) {
  const [form, setForm] = useState({ ...DEFAULT_FORM });

  useEffect(() => {
    if (open && tank) {
      setForm({
        tank_number: tank.tank_number,
        fuel_grade_id: tank.fuel_grade_id,
        capacity_litres: tank.capacity_litres,
        low_level_threshold: tank.low_level_threshold,
        is_active: tank.is_active,
      });
    } else if (open) {
      setForm({ ...DEFAULT_FORM });
    }
  }, [open, tank]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      tank_number: form.tank_number,
      fuel_grade_id: form.fuel_grade_id,
      capacity_litres: form.capacity_litres,
      low_level_threshold: form.low_level_threshold,
      is_active: form.is_active,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{tank ? "Edit Tank" : "Add Tank"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="tank-number">
                Tank # <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tank-number"
                placeholder="e.g. T1"
                required
                value={form.tank_number}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tank_number: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tank-fuel-grade">Product</Label>
              <Select
                value={form.fuel_grade_id}
                onValueChange={(val) =>
                  setForm((f) => ({ ...f, fuel_grade_id: val }))
                }
              >
                <SelectTrigger id="tank-fuel-grade">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {fuelGrades.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name} ({g.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tank-capacity">Capacity (L)</Label>
              <Input
                id="tank-capacity"
                type="number"
                min={0}
                placeholder="0"
                value={form.capacity_litres}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    capacity_litres: Number(e.target.value),
                  }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tank-low-level">Low Level Threshold (L)</Label>
              <Input
                id="tank-low-level"
                type="number"
                min={0}
                placeholder="0"
                value={form.low_level_threshold}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    low_level_threshold: Number(e.target.value),
                  }))
                }
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="tank-is-active"
                checked={form.is_active}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, is_active: Boolean(checked) }))
                }
              />
              <Label htmlFor="tank-is-active" className="text-sm font-normal">
                Active
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-gray-900 text-white rounded-xl">
              {tank ? "Save Changes" : "Add Tank"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
