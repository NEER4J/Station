"use client";

import { useRef, useState, useTransition } from "react";
import { Upload, Trash2, Eye, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { RawPumpsJson, PumpReport } from "@/types/database";
import type { ImportResult } from "@/lib/data/pump-reports";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface PumpReportImportClientProps {
  existingReports: Omit<PumpReport, "raw_json">[];
  importAction: (rawJson: RawPumpsJson) => Promise<ImportResult>;
  deleteAction: (id: string) => Promise<void>;
}

export function PumpReportImportClient({
  existingReports,
  importAction,
  deleteAction,
}: PumpReportImportClientProps) {
  const [parsedJson, setParsedJson] = useState<RawPumpsJson | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [resultMessage, setResultMessage] = useState<ImportResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const existingDates = new Set(existingReports.map((r) => r.business_date));
  const isDuplicate = parsedJson ? existingDates.has(parsedJson.business_date) : false;

  async function processFile(file: File) {
    setFileName(file.name);
    setParseError(null);
    setParsedJson(null);
    setResultMessage(null);

    try {
      const text = await file.text();
      const trimmed = text.trim();
      let json: Record<string, unknown>;

      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        json = JSON.parse(trimmed);
      } else if (trimmed.startsWith("<")) {
        json = parseXmlToJson(trimmed);
      } else {
        throw new Error("Unrecognized file format. Please upload a JSON or XML file.");
      }

      if (!json.business_date) throw new Error("Missing 'business_date' field in parsed data");
      if (!json.pumps || !Array.isArray(json.pumps)) throw new Error("Missing 'pumps' array in parsed data");
      if (!json.grades || !Array.isArray(json.grades)) throw new Error("Missing 'grades' array in parsed data");

      setParsedJson(json as unknown as RawPumpsJson);
    } catch (err) {
      setParseError(
        err instanceof SyntaxError
          ? "Invalid JSON file. Please check the file format."
          : err instanceof Error
            ? err.message
            : "Failed to parse file",
      );
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  }

  /** Parse Bulloch/XSite XML into the same JSON shape as pumps.json */
  function parseXmlToJson(xmlString: string): Record<string, unknown> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "text/xml");
    const parseError = doc.querySelector("parsererror");
    if (parseError) throw new Error("Invalid XML: " + parseError.textContent?.slice(0, 100));

    // Generic XML-to-object converter
    function nodeToObj(node: Element): unknown {
      const obj: Record<string, unknown> = {};
      // Attributes
      for (const attr of Array.from(node.attributes)) {
        obj[attr.name] = attr.value;
      }
      const children = Array.from(node.children);
      if (children.length === 0) {
        // Leaf node - return text content, try to parse as number
        const text = (node.textContent ?? "").trim();
        if (text === "") return Object.keys(obj).length ? obj : "";
        const num = Number(text);
        if (!isNaN(num) && text !== "") return num;
        if (text === "true") return true;
        if (text === "false") return false;
        return text;
      }
      // Group children by tag name
      const groups: Record<string, Element[]> = {};
      for (const child of children) {
        const tag = child.tagName;
        if (!groups[tag]) groups[tag] = [];
        groups[tag].push(child);
      }
      for (const [tag, elements] of Object.entries(groups)) {
        const camelTag = tag.replace(/_([a-z])/g, (_, c) => c.toUpperCase()).replace(/^([A-Z])/, (c) => c.toLowerCase());
        if (elements.length > 1) {
          obj[camelTag] = elements.map((el) => nodeToObj(el));
        } else {
          obj[camelTag] = nodeToObj(elements[0]);
        }
      }
      return obj;
    }

    // Find the root report element
    const root = doc.documentElement;
    const result = nodeToObj(root) as Record<string, unknown>;

    // Normalize: ensure arrays for known array fields
    const arrayFields = ["pumps", "grades", "grades_crind", "tanks", "products", "sections", "shifts", "deliveries", "fuel_tax_labels"];
    for (const field of arrayFields) {
      if (result[field] && !Array.isArray(result[field])) {
        result[field] = [result[field]];
      } else if (!result[field]) {
        result[field] = [];
      }
    }

    // Ensure sections categories are arrays
    if (Array.isArray(result.sections)) {
      for (const section of result.sections as Record<string, unknown>[]) {
        if (section.categories && !Array.isArray(section.categories)) {
          section.categories = [section.categories];
        }
      }
    }

    return result;
  }

  function handleSubmit() {
    if (!parsedJson) return;
    startTransition(async () => {
      try {
        const result = await importAction(parsedJson);
        setResultMessage(result);
        setParsedJson(null);
        setFileName(null);
        toast.success(
          result.isNew ? "Pump report imported successfully" : "Pump report updated successfully",
        );
      } catch {
        toast.error("Import failed. Please try again.");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteAction(id);
        toast.success("Report deleted");
      } catch {
        toast.error("Delete failed");
      }
    });
  }

  const fmt = (n: number | string, decimals = 2) =>
    Number(n).toLocaleString("en-CA", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  const fmtDollar = (n: number | string) => `$${fmt(n)}`;

  return (
    <div className="space-y-6">
      {/* File Upload Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold mb-4">Upload Pump Report</h2>
        <p className="text-sm text-gray-500 mb-4">
          Upload a .json or .xml file exported from the Bulloch POS / XSite system.
          The file should contain a daily pump report with pumps, grades, tanks, and sections data.
        </p>
        {/* Two options: click Browse or drag & drop */}
        <div
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const file = e.dataTransfer.files?.[0];
            if (file) processFile(file);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50"
        >
          <Upload className="h-8 w-8 text-gray-400 mb-2" />
          <span className="text-sm text-gray-500 mb-3">
            {fileName ?? "Drag & drop your file here, or:"}
          </span>
          <label className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-gray-800">
            Browse Files
            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>
          <span className="text-xs text-gray-400 mt-2">Supports .json, .xml (any case)</span>
        </div>
        {parseError && (
          <p className="text-sm text-red-500 mt-2">{parseError}</p>
        )}
      </div>

      {/* Duplicate Warning */}
      {isDuplicate && parsedJson && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-700">
            A report for <span className="font-semibold">{parsedJson.business_date}</span> already exists.
            Re-importing will overwrite the existing data.
          </div>
        </div>
      )}

      {/* Preview with Tabs */}
      {parsedJson && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">
              Preview &mdash; {parsedJson.business_date}
              {parsedJson.site?.name && (
                <span className="text-gray-400 font-normal ml-2">
                  {parsedJson.site.name}
                </span>
              )}
            </h2>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="bg-gray-900 text-white rounded-xl"
            >
              {isPending
                ? "Importing..."
                : isDuplicate
                  ? "Re-import & Overwrite"
                  : "Import Report"}
            </Button>
          </div>

          <Tabs defaultValue="summary">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="pumps">Pumps ({parsedJson.pumps?.length ?? 0})</TabsTrigger>
              <TabsTrigger value="grades">Grades ({parsedJson.grades?.length ?? 0})</TabsTrigger>
              <TabsTrigger value="tanks">Tanks ({parsedJson.tanks?.length ?? 0})</TabsTrigger>
              <TabsTrigger value="sections">Sections ({parsedJson.sections?.length ?? 0})</TabsTrigger>
            </TabsList>

            {/* Summary Tab */}
            <TabsContent value="summary">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {/* Report Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">Report Info</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Date</dt>
                      <dd className="font-medium">{parsedJson.business_date}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Report #</dt>
                      <dd className="font-medium">{parsedJson.number}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Status</dt>
                      <dd>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${parsedJson.status === "closed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {parsedJson.status}
                        </span>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Shifts</dt>
                      <dd className="font-medium">{parsedJson.shifts?.length ?? 0}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">POS</dt>
                      <dd className="font-medium">{parsedJson.site?.pos ?? "—"}</dd>
                    </div>
                  </dl>
                </div>

                {/* Fuel Summary */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">Fuel Summary</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Sold</dt>
                      <dd className="font-medium">{fmtDollar(parsedJson.fuel?.sold_dollars ?? 0)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Volume</dt>
                      <dd className="font-medium">{fmt(parsedJson.fuel?.sold_units ?? 0, 3)} L</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Cost of Sales</dt>
                      <dd className="font-medium">{fmtDollar(parsedJson.fuel?.cost_of_sales ?? 0)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Profit</dt>
                      <dd className="font-medium text-green-600">{fmtDollar(parsedJson.fuel?.profit ?? 0)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Margin</dt>
                      <dd className="font-medium">{fmt(Number(parsedJson.fuel?.margin ?? 0) * 100, 1)}%</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Over/Short</dt>
                      <dd className={`font-medium ${Number(parsedJson.fuel?.over_short ?? 0) < 0 ? "text-red-600" : "text-green-600"}`}>
                        {fmt(parsedJson.fuel?.over_short ?? 0, 3)} L
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Financial Summary */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">Financial Summary</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Additive</dt>
                      <dd className="font-medium">{fmtDollar(parsedJson.financial?.types?.additive?.amount ?? 0)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Subtractive</dt>
                      <dd className="font-medium">{fmtDollar(parsedJson.financial?.types?.subtractive?.amount ?? 0)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Memo</dt>
                      <dd className="font-medium">{fmtDollar(parsedJson.financial?.types?.memo?.amount ?? 0)}</dd>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <dt className="text-gray-500 font-medium">Over/Short</dt>
                      <dd className={`font-semibold ${Number(parsedJson.financial?.types?.summary?.over_short ?? 0) > 50 ? "text-red-600" : Number(parsedJson.financial?.types?.summary?.over_short ?? 0) < -50 ? "text-red-600" : "text-green-600"}`}>
                        {fmtDollar(parsedJson.financial?.types?.summary?.over_short ?? 0)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Issues */}
              {((parsedJson.issues?.error?.length ?? 0) > 0 || (parsedJson.issues?.warning?.length ?? 0) > 0) && (
                <div className="mt-4 space-y-2">
                  {parsedJson.issues?.error?.map((issue, i) => (
                    <div key={`err-${i}`} className="flex items-start gap-2 bg-red-50 rounded-lg p-3 text-sm text-red-700">
                      <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      {issue.issue}
                    </div>
                  ))}
                  {parsedJson.issues?.warning?.map((issue, i) => (
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
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      {["Pump", "Hose", "Grade", "Meter $", "Meter Units", "Prev Meter $", "Prev Meter Units", "Sold $", "Sold Units"].map((col) => (
                        <th key={col} className="text-left px-3 py-2 font-medium text-gray-600">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedJson.pumps?.map((p, i) => (
                      <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
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
                </table>
              </div>
            </TabsContent>

            {/* Grades Tab */}
            <TabsContent value="grades">
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      {["Grade", "Sold Units", "Sold $", "Avg Price", "Cost of Sales", "Profit", "Margin %", "Blended"].map((col) => (
                        <th key={col} className="text-left px-3 py-2 font-medium text-gray-600">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedJson.grades?.map((g, i) => (
                      <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-1.5 font-medium">{g.name} ({g.external_id})</td>
                        <td className="px-3 py-1.5 text-right">{fmt(g.sold_units, 3)}</td>
                        <td className="px-3 py-1.5 text-right">{fmtDollar(g.sold_dollars)}</td>
                        <td className="px-3 py-1.5 text-right">{fmtDollar(g.average_price)}</td>
                        <td className="px-3 py-1.5 text-right">{fmtDollar(g.cost_of_sales)}</td>
                        <td className="px-3 py-1.5 text-right text-green-600 font-medium">{fmtDollar(g.profit)}</td>
                        <td className="px-3 py-1.5 text-right">{fmt(Number(g.margin) * 100, 1)}%</td>
                        <td className="px-3 py-1.5 text-center">{g.blended ? "Yes" : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Products / Inventory reconciliation */}
                {parsedJson.products && parsedJson.products.length > 0 && (
                  <>
                    <h3 className="font-semibold mt-6 mb-3">Inventory Reconciliation</h3>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          {["Product", "Opening", "Closing", "Deliveries", "Dispensed (Tanks)", "Dispensed (Meters)", "Over/Short", "Inventory Value"].map((col) => (
                            <th key={col} className="text-left px-3 py-2 font-medium text-gray-600">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsedJson.products.map((p, i) => (
                          <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="px-3 py-1.5 font-medium">{p.name}</td>
                            <td className="px-3 py-1.5 text-right">{fmt(p.opening, 0)}</td>
                            <td className="px-3 py-1.5 text-right">{fmt(p.closing, 0)}</td>
                            <td className="px-3 py-1.5 text-right">{fmt(p.deliveries, 0)}</td>
                            <td className="px-3 py-1.5 text-right">{fmt(p.dispensed_tanks, 3)}</td>
                            <td className="px-3 py-1.5 text-right">{fmt(p.dispensed_meters, 3)}</td>
                            <td className={`px-3 py-1.5 text-right font-medium ${p.over_short < 0 ? "text-red-600" : "text-green-600"}`}>
                              {fmt(p.over_short, 3)}
                            </td>
                            <td className="px-3 py-1.5 text-right">{fmtDollar(p.value_of_inventory)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </TabsContent>

            {/* Tanks Tab */}
            <TabsContent value="tanks">
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      {["Product", "Capacity", "Current Units", "Previous Units", "Change", "Dip", "Water", "Closing Qty"].map((col) => (
                        <th key={col} className="text-left px-3 py-2 font-medium text-gray-600">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedJson.tanks?.map((t, i) => {
                      const fillPct = t.capacity > 0 ? (t.units / t.capacity) * 100 : 0;
                      return (
                        <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-3 py-1.5 font-medium">{t.product_name}</td>
                          <td className="px-3 py-1.5 text-right">{fmt(t.capacity, 0)}</td>
                          <td className="px-3 py-1.5 text-right">
                            {fmt(t.units, 0)}
                            <span className="text-gray-400 text-xs ml-1">({fmt(fillPct, 1)}%)</span>
                          </td>
                          <td className="px-3 py-1.5 text-right">{fmt(t.previous_units, 0)}</td>
                          <td className="px-3 py-1.5 text-right font-medium text-red-600">-{fmt(t.change_units, 0)}</td>
                          <td className="px-3 py-1.5 text-right">{t.dip || "—"}</td>
                          <td className="px-3 py-1.5 text-right">{t.water || "—"}</td>
                          <td className="px-3 py-1.5 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                              {t.closing_qty}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* Sections Tab */}
            <TabsContent value="sections">
              <div className="space-y-4 mt-4">
                {parsedJson.sections?.map((section, si) => (
                  <div key={si} className="bg-gray-50 rounded-xl p-4">
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
      )}

      {/* Import Result */}
      {resultMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
          <div className="flex items-start gap-2 text-green-700">
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">
                Report {resultMessage.isNew ? "imported" : "updated"} successfully
              </p>
              <p className="mt-1">
                Grades matched: {resultMessage.gradesMatched}
                {resultMessage.gradesUnmatched.length > 0 && (
                  <span className="text-amber-600">
                    {" "}&middot; Unmatched: {resultMessage.gradesUnmatched.join(", ")}
                  </span>
                )}
              </p>
              <p>
                Tanks matched: {resultMessage.tanksMatched}
                {resultMessage.tanksUnmatched.length > 0 && (
                  <span className="text-amber-600">
                    {" "}&middot; Unmatched: {resultMessage.tanksUnmatched.join(", ")}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Existing Reports List */}
      {existingReports.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold mb-4">Imported Reports</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {["Date", "Report #", "Status", "Fuel Sales", "Fuel Profit", "Over/Short ($)", "Fuel O/S (L)", "Actions"].map((col) => (
                    <th key={col} className="text-left px-3 py-2 font-medium text-gray-600">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {existingReports.map((r) => (
                  <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium">{r.business_date}</td>
                    <td className="px-3 py-2">{r.report_number ?? "—"}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${r.status === "closed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">{fmtDollar(r.fuel_sold_dollars)}</td>
                    <td className="px-3 py-2 text-right text-green-600">{fmtDollar(r.fuel_profit)}</td>
                    <td className={`px-3 py-2 text-right font-medium ${Math.abs(r.financial_over_short) > 50 ? "text-red-600" : "text-green-600"}`}>
                      {fmtDollar(r.financial_over_short)}
                    </td>
                    <td className={`px-3 py-2 text-right ${r.fuel_over_short < 0 ? "text-red-600" : "text-green-600"}`}>
                      {fmt(r.fuel_over_short, 3)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/dashboard/pump_report_import/${r.id}`}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={isPending}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
