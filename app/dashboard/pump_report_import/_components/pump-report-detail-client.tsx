"use client";

import { AlertTriangle, XCircle } from "lucide-react";
import type { PumpReport } from "@/types/database";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface PumpReportDetailClientProps {
  report: PumpReport;
}

export function PumpReportDetailClient({ report }: PumpReportDetailClientProps) {
  const fmt = (n: number | string, decimals = 2) =>
    Number(n).toLocaleString("en-CA", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  const fmtDollar = (n: number | string) => `$${fmt(n)}`;

  const pumps = report.pumps ?? [];
  const grades = report.grades ?? [];
  const sections = report.sections ?? [];
  const issues = report.issues ?? {};

  return (
    <div className="space-y-6">
      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="pumps">Pumps ({pumps.length})</TabsTrigger>
          <TabsTrigger value="grades">Grades ({grades.length})</TabsTrigger>
          <TabsTrigger value="sections">Sections ({sections.length})</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {/* Report Info */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">Report Info</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Date</dt>
                  <dd className="font-medium">{report.business_date}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Report #</dt>
                  <dd className="font-medium">{report.report_number ?? "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Status</dt>
                  <dd>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${report.status === "closed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {report.status}
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Shifts</dt>
                  <dd className="font-medium">{report.shift_count}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Site</dt>
                  <dd className="font-medium">{report.site_name ?? "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">POS</dt>
                  <dd className="font-medium">{report.pos_type ?? "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Imported</dt>
                  <dd className="font-medium text-xs">{new Date(report.imported_at).toLocaleString()}</dd>
                </div>
              </dl>
            </div>

            {/* Fuel Summary */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">Fuel Summary</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Sold</dt>
                  <dd className="font-medium">{fmtDollar(report.fuel_sold_dollars)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Volume</dt>
                  <dd className="font-medium">{fmt(report.fuel_sold_units, 3)} L</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Cost of Sales</dt>
                  <dd className="font-medium">{fmtDollar(report.fuel_cost_of_sales)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Profit</dt>
                  <dd className="font-medium text-green-600">{fmtDollar(report.fuel_profit)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Margin</dt>
                  <dd className="font-medium">{fmt(Number(report.fuel_margin) * 100, 1)}%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Over/Short</dt>
                  <dd className={`font-medium ${report.fuel_over_short < 0 ? "text-red-600" : "text-green-600"}`}>
                    {fmt(report.fuel_over_short, 3)} L
                  </dd>
                </div>
              </dl>
            </div>

            {/* Financial Summary */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">Financial Summary</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Additive</dt>
                  <dd className="font-medium">{fmtDollar(report.financial_additive)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Subtractive</dt>
                  <dd className="font-medium">{fmtDollar(report.financial_subtractive)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Memo</dt>
                  <dd className="font-medium">{fmtDollar(report.financial_memo)}</dd>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <dt className="text-gray-500 font-medium">Over/Short</dt>
                  <dd className={`font-semibold ${Math.abs(report.financial_over_short) > 50 ? "text-red-600" : "text-green-600"}`}>
                    {fmtDollar(report.financial_over_short)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Issues */}
          {((issues.error?.length ?? 0) > 0 || (issues.warning?.length ?? 0) > 0) && (
            <div className="mt-4 space-y-2">
              {issues.error?.map((issue, i) => (
                <div key={`err-${i}`} className="flex items-start gap-2 bg-red-50 rounded-lg p-3 text-sm text-red-700">
                  <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  {issue.issue}
                </div>
              ))}
              {issues.warning?.map((issue, i) => (
                <div key={`warn-${i}`} className="flex items-start gap-2 bg-amber-50 rounded-lg p-3 text-sm text-amber-700">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  {issue.issue}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Pumps Tab */}
        <TabsContent value="pumps">
          <div className="bg-white rounded-xl shadow-sm p-6 mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {["Pump", "Hose", "Grade", "Meter $", "Meter Units", "Prev Meter $", "Prev Meter Units", "Sold $", "Sold Units"].map((col) => (
                    <th key={col} className="text-left px-3 py-2 font-medium text-gray-600">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pumps.map((p) => (
                  <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-1.5 font-medium">{p.pump_number}</td>
                    <td className="px-3 py-1.5">{p.hose_number}</td>
                    <td className="px-3 py-1.5">{p.grade_name}</td>
                    <td className="px-3 py-1.5 text-right font-mono text-xs">{fmtDollar(p.meter_dollars)}</td>
                    <td className="px-3 py-1.5 text-right font-mono text-xs">{fmt(p.meter_units, 3)}</td>
                    <td className="px-3 py-1.5 text-right font-mono text-xs">{fmtDollar(p.previous_meter_dollars)}</td>
                    <td className="px-3 py-1.5 text-right font-mono text-xs">{fmt(p.previous_meter_units, 3)}</td>
                    <td className="px-3 py-1.5 text-right font-medium">{fmtDollar(p.sold_dollars)}</td>
                    <td className="px-3 py-1.5 text-right font-medium">{fmt(p.sold_units, 3)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 font-semibold">
                  <td colSpan={7} className="px-3 py-2">Total</td>
                  <td className="px-3 py-2 text-right">{fmtDollar(pumps.reduce((s, p) => s + Number(p.sold_dollars), 0))}</td>
                  <td className="px-3 py-2 text-right">{fmt(pumps.reduce((s, p) => s + Number(p.sold_units), 0), 3)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </TabsContent>

        {/* Grades Tab */}
        <TabsContent value="grades">
          <div className="bg-white rounded-xl shadow-sm p-6 mt-4 overflow-x-auto">
            <h3 className="font-semibold mb-3">Sales by Grade</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {["Grade", "Sold Units", "Sold $", "Avg Price", "Avg Cost", "Cost of Sales", "Profit", "Margin %"].map((col) => (
                    <th key={col} className="text-left px-3 py-2 font-medium text-gray-600">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grades.map((g) => (
                  <tr key={g.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-1.5 font-medium">
                      {g.name}
                      {g.blended && <span className="text-xs text-gray-400 ml-1">(blended)</span>}
                    </td>
                    <td className="px-3 py-1.5 text-right">{fmt(g.sold_units, 3)}</td>
                    <td className="px-3 py-1.5 text-right">{fmtDollar(g.sold_dollars)}</td>
                    <td className="px-3 py-1.5 text-right">{fmtDollar(g.average_price)}</td>
                    <td className="px-3 py-1.5 text-right">{fmtDollar(g.average_cost)}</td>
                    <td className="px-3 py-1.5 text-right">{fmtDollar(g.cost_of_sales)}</td>
                    <td className="px-3 py-1.5 text-right text-green-600 font-medium">{fmtDollar(g.profit)}</td>
                    <td className="px-3 py-1.5 text-right">{fmt(Number(g.margin) * 100, 1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Inventory Reconciliation */}
            {grades.some((g) => g.product_opening > 0 || g.product_closing > 0) && (
              <>
                <h3 className="font-semibold mt-8 mb-3">Inventory Reconciliation</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      {["Product", "Opening", "Closing", "Deliveries", "Dispensed (Tanks)", "Dispensed (Meters)", "Over/Short", "Inventory Value"].map((col) => (
                        <th key={col} className="text-left px-3 py-2 font-medium text-gray-600">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {grades
                      .filter((g) => g.product_opening > 0 || g.product_closing > 0)
                      .map((g) => (
                        <tr key={g.id} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-3 py-1.5 font-medium">{g.name}</td>
                          <td className="px-3 py-1.5 text-right">{fmt(g.product_opening, 0)}</td>
                          <td className="px-3 py-1.5 text-right">{fmt(g.product_closing, 0)}</td>
                          <td className="px-3 py-1.5 text-right">{fmt(g.product_deliveries, 0)}</td>
                          <td className="px-3 py-1.5 text-right">{fmt(g.dispensed_tanks, 3)}</td>
                          <td className="px-3 py-1.5 text-right">{fmt(g.dispensed_meters, 3)}</td>
                          <td className={`px-3 py-1.5 text-right font-medium ${g.over_short < 0 ? "text-red-600" : "text-green-600"}`}>
                            {fmt(g.over_short, 3)}
                          </td>
                          <td className="px-3 py-1.5 text-right">{fmtDollar(g.value_of_inventory)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </>
            )}

            {/* CRIND Breakdown */}
            {grades.some((g) => g.sold_units_crind > 0 || g.sold_units_kiosk > 0) && (
              <>
                <h3 className="font-semibold mt-8 mb-3">CRIND (Pay-at-Pump) Breakdown</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      {["Grade", "CRIND Units", "CRIND $", "Kiosk Units", "Kiosk $", "Tax 1 CRIND", "Tax 2 CRIND"].map((col) => (
                        <th key={col} className="text-left px-3 py-2 font-medium text-gray-600">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((g) => (
                      <tr key={g.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-1.5 font-medium">{g.name}</td>
                        <td className="px-3 py-1.5 text-right">{fmt(g.sold_units_crind, 3)}</td>
                        <td className="px-3 py-1.5 text-right">{fmtDollar(g.sold_dollars_crind)}</td>
                        <td className="px-3 py-1.5 text-right">{fmt(g.sold_units_kiosk, 3)}</td>
                        <td className="px-3 py-1.5 text-right">{fmtDollar(g.sold_dollars_kiosk)}</td>
                        <td className="px-3 py-1.5 text-right">{fmtDollar(g.tax_one_crind)}</td>
                        <td className="px-3 py-1.5 text-right">{fmtDollar(g.tax_two_crind)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections">
          <div className="space-y-4 mt-4">
            {sections.map((section, si) => (
              <div key={si} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{section.name}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      section.type === "additive"
                        ? "bg-green-100 text-green-700"
                        : section.type === "subtractive"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-200 text-gray-600"
                    }`}>
                      {section.type}
                    </span>
                  </div>
                  <span className="font-semibold text-sm">{fmtDollar(section.amount)}</span>
                </div>
                {section.categories && section.categories.length > 0 && (
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left px-2 py-1 text-xs font-medium text-gray-500">Category</th>
                        <th className="text-right px-2 py-1 text-xs font-medium text-gray-500">Count</th>
                        <th className="text-right px-2 py-1 text-xs font-medium text-gray-500">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.categories
                        .filter((c) => c.amount !== 0 || c.count !== 0)
                        .map((cat, ci) => (
                          <tr key={ci} className="border-t border-gray-200">
                            <td className="px-2 py-1">{cat.name}</td>
                            <td className="px-2 py-1 text-right font-mono text-xs">{cat.count || "—"}</td>
                            <td className="px-2 py-1 text-right font-medium">{fmtDollar(cat.amount)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
