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
import { Input } from "@/components/ui/input";

interface LiquorImportFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Record<string, unknown>) => void;
}

export function LiquorImportFormDialog({
  open,
  onOpenChange,
  onSubmit,
}: LiquorImportFormDialogProps) {
  const [isRegular, setIsRegular] = useState(true);
  const [ltoStart, setLtoStart] = useState("");
  const [ltoEnd, setLtoEnd] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      is_regular: isRegular,
      lto_start_date: isRegular ? null : ltoStart || null,
      lto_end_date: isRegular ? null : ltoEnd || null,
    });
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setIsRegular(true);
      setLtoStart("");
      setLtoEnd("");
    }
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Liquor Import</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Import Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                className={
                  isRegular
                    ? "bg-gray-900 text-white rounded-xl"
                    : "rounded-xl"
                }
                variant={isRegular ? "default" : "outline"}
                onClick={() => setIsRegular(true)}
              >
                Regular
              </Button>
              <Button
                type="button"
                className={
                  !isRegular
                    ? "bg-gray-900 text-white rounded-xl"
                    : "rounded-xl"
                }
                variant={!isRegular ? "default" : "outline"}
                onClick={() => setIsRegular(false)}
              >
                LTO
              </Button>
            </div>
          </div>

          {!isRegular && (
            <>
              <div className="space-y-2">
                <Label htmlFor="lto_start_date">LTO Start Date</Label>
                <Input
                  id="lto_start_date"
                  type="date"
                  value={ltoStart}
                  onChange={(e) => setLtoStart(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lto_end_date">LTO End Date</Label>
                <Input
                  id="lto_end_date"
                  type="date"
                  value={ltoEnd}
                  onChange={(e) => setLtoEnd(e.target.value)}
                />
              </div>
            </>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-gray-900 text-white rounded-xl">
              Create Import
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
