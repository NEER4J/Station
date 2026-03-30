"use client";

import { useState, useEffect } from "react";
import type { UserWithProfile } from "@/lib/data/users";
import type { Role } from "@/types/database";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserWithProfile;
  roles: Role[];
  stations: { id: string; name: string }[];
  onSubmit: (data: Record<string, unknown>) => void;
}

export function UserEditDialog({
  open,
  onOpenChange,
  user,
  roles,
  stations,
  onSubmit,
}: Props) {
  const [form, setForm] = useState({
    role_id: "",
    station_id: "",
    full_name: "",
    is_active: true,
  });

  useEffect(() => {
    if (user) {
      setForm({
        role_id: user.role_id ?? "",
        station_id: user.station_id ?? "",
        full_name: user.full_name ?? "",
        is_active: user.is_active,
      });
    } else {
      setForm({
        role_id: "",
        station_id: "",
        full_name: "",
        is_active: true,
      });
    }
  }, [user]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      role_id: form.role_id || null,
      station_id: form.station_id || null,
      full_name: form.full_name || null,
      is_active: form.is_active,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {user ? `Edit User \u2014 ${user.full_name ?? "Unnamed"}` : "Edit User"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="user-full-name">Full Name</Label>
            <Input
              id="user-full-name"
              value={form.full_name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, full_name: e.target.value }))
              }
              placeholder="Full name"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="user-role">Role</Label>
            <Select
              value={form.role_id}
              onValueChange={(val) =>
                setForm((prev) => ({ ...prev, role_id: val }))
              }
            >
              <SelectTrigger id="user-role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    <span className="capitalize">{role.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="user-station">Site</Label>
            <Select
              value={form.station_id}
              onValueChange={(val) =>
                setForm((prev) => ({
                  ...prev,
                  station_id: val === "__none__" ? "" : val,
                }))
              }
            >
              <SelectTrigger id="user-station">
                <SelectValue placeholder="Select a site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {stations.map((station) => (
                  <SelectItem key={station.id} value={station.id}>
                    {station.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="user-is-active"
              checked={form.is_active}
              onCheckedChange={(checked) =>
                setForm((prev) => ({
                  ...prev,
                  is_active: checked === true,
                }))
              }
            />
            <Label htmlFor="user-is-active" className="cursor-pointer">
              Active
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-gray-900 text-white rounded-xl">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
