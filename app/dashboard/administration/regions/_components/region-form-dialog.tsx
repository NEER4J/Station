"use client";

import { useState, useEffect } from "react";
import type { Region } from "@/types/database";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  region: Region | null;
  onSave: (data: { name: string; category: string }) => void;
  isPending?: boolean;
}

export function RegionFormDialog({
  open,
  onOpenChange,
  region,
  onSave,
  isPending,
}: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  // Sync form state when the target region changes
  useEffect(() => {
    if (region) {
      setName(region.name);
      setCategory(region.category ?? "");
    } else {
      setName("");
      setCategory("");
    }
  }, [region]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), category: category.trim() });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{region ? "Edit Region" : "New Region"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="region-name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="region-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Western Canada"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="region-category">Category</Label>
            <Input
              id="region-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Province, District (optional)"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isPending}
              className="bg-gray-900 text-white rounded-xl"
            >
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
