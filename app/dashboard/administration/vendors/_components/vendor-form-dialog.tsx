"use client";

import { useState, useEffect } from "react";
import type { Vendor } from "@/types/database";
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
  vendor?: Vendor;
  onSave: (data: { vendor_code: string; name: string }) => void;
  isPending?: boolean;
}

export function VendorFormDialog({
  open,
  onOpenChange,
  vendor,
  onSave,
  isPending,
}: Props) {
  const [vendorCode, setVendorCode] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (vendor) {
      setVendorCode(vendor.vendor_code);
      setName(vendor.name);
    } else {
      setVendorCode("");
      setName("");
    }
  }, [vendor]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vendorCode.trim() || !name.trim()) return;
    onSave({ vendor_code: vendorCode.trim(), name: name.trim() });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {vendor ? "Edit Vendor" : "Add Vendor"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="vendor-code">
              Vendor ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="vendor-code"
              value={vendorCode}
              onChange={(e) => setVendorCode(e.target.value)}
              placeholder="e.g. VND-001"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vendor-name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="vendor-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Vendor name"
              required
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
              disabled={!vendorCode.trim() || !name.trim() || isPending}
              className="bg-gray-900 text-white rounded-xl"
            >
              {isPending ? "Saving\u2026" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
