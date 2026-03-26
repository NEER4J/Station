"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ShelfTag } from "@/types/database";

interface ShelfTagFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shelfTag?: ShelfTag;
  onSubmit: (id: string, unitOrOrder: string) => void;
}

export function ShelfTagFormDialog({
  open,
  onOpenChange,
  shelfTag,
  onSubmit,
}: ShelfTagFormDialogProps) {
  const [unitOrOrder, setUnitOrOrder] = useState<string>(
    shelfTag?.unit_or_order ?? "EA",
  );

  const handleSubmit = () => {
    if (shelfTag) {
      onSubmit(shelfTag.id, unitOrOrder);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Shelf Tag</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-gray-500">
            {(shelfTag?.item as unknown as Record<string, unknown>)?.description as string ?? "Unknown item"}
          </p>
          <div className="space-y-1.5">
            <Label>Unit Type</Label>
            <Select value={unitOrOrder} onValueChange={setUnitOrOrder}>
              <SelectTrigger className="bg-gray-100 border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EA">Each (EA)</SelectItem>
                <SelectItem value="CS">Case (CS)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gray-900 text-white rounded-xl"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
