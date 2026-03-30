"use client";

import { useState, useEffect } from "react";
import type { SiteWithDetails } from "@/lib/data/site-details";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site?: SiteWithDetails;
  onSubmit: (data: Record<string, unknown>) => void;
  isPending?: boolean;
}

export function SiteDetailFormDialog({
  open,
  onOpenChange,
  site,
  onSubmit,
  isPending,
}: Props) {
  const [form, setForm] = useState({
    site_code: "",
    pending_changes: 0,
    sftp_enabled: false,
    realtime_enabled: false,
    connectivity_notes: "",
  });

  useEffect(() => {
    if (open && site) {
      setForm({
        site_code: site.details?.site_code ?? "",
        pending_changes: site.details?.pending_changes ?? 0,
        sftp_enabled: site.details?.sftp_enabled ?? false,
        realtime_enabled: site.details?.realtime_enabled ?? false,
        connectivity_notes: site.details?.connectivity_notes ?? "",
      });
    } else if (open) {
      setForm({
        site_code: "",
        pending_changes: 0,
        sftp_enabled: false,
        realtime_enabled: false,
        connectivity_notes: "",
      });
    }
  }, [open, site]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      site_code: form.site_code || null,
      pending_changes: form.pending_changes,
      sftp_enabled: form.sftp_enabled,
      realtime_enabled: form.realtime_enabled,
      connectivity_notes: form.connectivity_notes || null,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Edit Site Details {site ? `\u2014 ${site.name}` : ""}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="site-code">Site Code</Label>
            <Input
              id="site-code"
              value={form.site_code}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, site_code: e.target.value }))
              }
              placeholder="e.g. STN-001"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pending-changes">Pending Changes</Label>
            <Input
              id="pending-changes"
              type="number"
              min={0}
              value={form.pending_changes}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  pending_changes: parseInt(e.target.value, 10) || 0,
                }))
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="sftp-enabled"
              checked={form.sftp_enabled}
              onCheckedChange={(checked) =>
                setForm((prev) => ({
                  ...prev,
                  sftp_enabled: checked === true,
                }))
              }
            />
            <Label htmlFor="sftp-enabled" className="cursor-pointer">
              SFTP Enabled
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="realtime-enabled"
              checked={form.realtime_enabled}
              onCheckedChange={(checked) =>
                setForm((prev) => ({
                  ...prev,
                  realtime_enabled: checked === true,
                }))
              }
            />
            <Label htmlFor="realtime-enabled" className="cursor-pointer">
              Realtime Enabled
            </Label>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="connectivity-notes">Connectivity Notes</Label>
            <Textarea
              id="connectivity-notes"
              value={form.connectivity_notes}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  connectivity_notes: e.target.value,
                }))
              }
              placeholder="Any notes about connectivity..."
              rows={3}
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
              disabled={isPending}
              className="bg-gray-900 text-white rounded-xl"
            >
              {isPending ? "Saving\u2026" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
