"use client";

import { useEffect, useState } from "react";
import type { FuelGrade } from "@/types/database";
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

interface FuelGradeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grade?: FuelGrade;
  onSubmit: (data: Record<string, unknown>) => void;
}

const DEFAULT_FORM = {
  name: "",
  code: "",
  color: "",
  sort_order: 0,
  is_active: true,
};

export function FuelGradeFormDialog({
  open,
  onOpenChange,
  grade,
  onSubmit,
}: FuelGradeFormDialogProps) {
  const [form, setForm] = useState({ ...DEFAULT_FORM });

  useEffect(() => {
    if (open && grade) {
      setForm({
        name: grade.name,
        code: grade.code,
        color: grade.color ?? "",
        sort_order: grade.sort_order,
        is_active: grade.is_active,
      });
    } else if (open) {
      setForm({ ...DEFAULT_FORM });
    }
  }, [open, grade]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      name: form.name,
      code: form.code,
      color: form.color || null,
      sort_order: form.sort_order,
      is_active: form.is_active,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{grade ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="grade-name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="grade-name"
                placeholder="e.g. Regular Unleaded"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="grade-code">
                Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="grade-code"
                placeholder="e.g. REG"
                required
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="grade-color">Color (hex, optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="grade-color"
                  placeholder="#FF0000"
                  value={form.color}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, color: e.target.value }))
                  }
                />
                {form.color && (
                  <div
                    className="h-8 w-8 flex-shrink-0 rounded-md border border-gray-200"
                    style={{ backgroundColor: form.color }}
                  />
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="grade-sort-order">Sort Order</Label>
              <Input
                id="grade-sort-order"
                type="number"
                placeholder="0"
                value={form.sort_order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))
                }
              />
            </div>

            <div className="flex items-center gap-2 pt-5">
              <Checkbox
                id="grade-is-active"
                checked={form.is_active}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, is_active: Boolean(checked) }))
                }
              />
              <Label htmlFor="grade-is-active" className="text-sm font-normal">
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
              {grade ? "Save Changes" : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
