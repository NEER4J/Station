"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { ArrowRight, FileUp, Package, Tag, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTransition } from "react";

export function UserToolsClient() {
  const [isPending, startTransition] = useTransition();

  function handleClearCache() {
    startTransition(async () => {
      // In production this would call a server action to revalidate
      await new Promise((r) => setTimeout(r, 500));
      toast.success("Cache cleared successfully");
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Tools"
        subtitle="Import data, manage bulk updates and system utilities"
        backHref="/dashboard"
      />

      {/* Data Imports */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-base">Data Imports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/liquor_imports"
            className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-colors group"
          >
            <div>
              <p className="font-medium text-sm">Liquor Import</p>
              <p className="text-xs text-gray-500 mt-0.5">Import LCBO/liquor pricing batches</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-700" />
          </Link>
          <Link
            href="/dashboard/batch_promotions"
            className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-colors group"
          >
            <div>
              <p className="font-medium text-sm">Pricing Update</p>
              <p className="text-xs text-gray-500 mt-0.5">Batch promotional price updates</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-700" />
          </Link>
          <Link
            href="/dashboard/fuel_tank_import"
            className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-colors group"
          >
            <div>
              <p className="font-medium text-sm">Fuel Tank Import</p>
              <p className="text-xs text-gray-500 mt-0.5">Upload Excel dip readings (.xlsx)</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-700" />
          </Link>
          <Link
            href="/dashboard/Items"
            className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-colors group"
          >
            <div>
              <p className="font-medium text-sm">Item Catalogue</p>
              <p className="text-xs text-gray-500 mt-0.5">Manage and export item records</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-700" />
          </Link>
        </div>
      </div>

      {/* Bulk Excel Updates */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-base">Bulk Excel Updates</h2>
        <p className="text-sm text-gray-500">
          Upload a .xlsx file to perform bulk updates across product data.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Update Category</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Supported Fields</th>
                <th className="px-4 py-2.5 w-40"></th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  category: "General Update",
                  fields: "Departments, Subdepartments, Items, Suppliers",
                },
                {
                  category: "Metadata Sync",
                  fields: "Descriptions, Part Numbers, Item Costs, Order Units, Case Sizes",
                },
                {
                  category: "Status Management",
                  fields: "Bulk item activation / deactivation",
                },
              ].map((row) => (
                <tr key={row.category} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{row.category}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{row.fields}</td>
                  <td className="px-4 py-3">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer text-gray-700 hover:text-gray-900">
                      <FileUp className="h-3.5 w-3.5" />
                      Upload .xlsx
                      <input
                        type="file"
                        accept=".xlsx"
                        className="hidden"
                        onChange={() => toast.info("Bulk import coming soon")}
                      />
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Maintenance */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-base">System Maintenance</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="gap-2 rounded-xl"
            onClick={handleClearCache}
            disabled={isPending}
          >
            <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
            {isPending ? "Clearing..." : "Clear Cache"}
          </Button>
          <Link href="/dashboard/Items">
            <Button variant="outline" className="gap-2 rounded-xl">
              <Download className="h-4 w-4" />
              Export All Items
            </Button>
          </Link>
          <Link href="/dashboard/shelf_tags">
            <Button variant="outline" className="gap-2 rounded-xl">
              <Tag className="h-4 w-4" />
              Shelf Tag Queue
            </Button>
          </Link>
          <Link href="/dashboard/batch_posts">
            <Button variant="outline" className="gap-2 rounded-xl">
              <Package className="h-4 w-4" />
              View Batch Posts
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
