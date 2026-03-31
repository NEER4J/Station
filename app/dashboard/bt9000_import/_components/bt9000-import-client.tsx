"use client";

import { useRef, useState } from "react";
import { Upload, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type {
  BT9000ParsedData,
  BT9000Department,
  BT9000PriceGroup,
  BT9000Item,
  BT9000DealGroup,
  BT9000Payout,
  BT9000TenderCoupon,
  BT9000Import,
} from "@/types/database";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface BT9000ImportClientProps {
  importHistory: BT9000Import[];
  importDepartmentsAction: (d: BT9000Department[]) => Promise<Record<string, string>>;
  importPriceGroupsAction: (pg: BT9000PriceGroup[]) => Promise<Record<string, string>>;
  importItemsBatchAction: (items: BT9000Item[], deptMap: Record<string, string>, pgMap: Record<string, string>) => Promise<number>;
  importDealGroupsAction: (dg: BT9000DealGroup[]) => Promise<number>;
  importPayoutsAction: (p: BT9000Payout[]) => Promise<number>;
  importTenderCouponsAction: (tc: BT9000TenderCoupon[]) => Promise<number>;
  recordImportAction: (data: {
    file_name: string;
    bt9000_version: string | null;
    bt9000_station_id: string | null;
    file_creation_date: string | null;
    departments_count: number;
    items_count: number;
    price_groups_count: number;
    deal_groups_count: number;
    payouts_count: number;
    tender_coupons_count: number;
  }) => Promise<string>;
  deleteImportAction: (id: string) => Promise<void>;
}

type ImportPhase = "idle" | "departments" | "price_groups" | "items" | "deal_groups" | "payouts" | "tender_coupons" | "recording" | "done" | "error";

export function BT9000ImportClient({
  importHistory,
  importDepartmentsAction,
  importPriceGroupsAction,
  importItemsBatchAction,
  importDealGroupsAction,
  importPayoutsAction,
  importTenderCouponsAction,
  recordImportAction,
  deleteImportAction,
}: BT9000ImportClientProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedData, setParsedData] = useState<BT9000ParsedData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importPhase, setImportPhase] = useState<ImportPhase>("idle");
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, label: "" });
  const [importError, setImportError] = useState<string | null>(null);
  const [itemsVisible, setItemsVisible] = useState(50);

  // ---- XML Parser ----

  function parseBT9000XML(xmlString: string): BT9000ParsedData {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "text/xml");
    const err = doc.querySelector("parsererror");
    if (err) throw new Error("Invalid XML: " + (err.textContent?.slice(0, 100) ?? ""));

    const text = (el: Element | null, tag: string): string =>
      (el?.getElementsByTagName(tag)[0]?.textContent ?? "").trim();

    const flag = (el: Element | null, tag: string): boolean =>
      text(el, tag).toUpperCase() === "Y";

    const num = (el: Element | null, tag: string): number =>
      Number(text(el, tag)) || 0;

    const root = doc.documentElement;

    // Metadata
    const metadata = {
      bt9000Version: text(root, "BT9000_Version"),
      generatedBy: text(root, "Generated_By"),
      stationId: text(root, "Station_ID"),
      fileCreationDate: text(root, "File_Creation_Date"),
    };

    // Departments
    const deptEls = root.getElementsByTagName("Department");
    const departments: BT9000Department[] = [];
    for (let i = 0; i < deptEls.length; i++) {
      const el = deptEls[i];
      // Only top-level departments (under <Departments>), not <Department> inside items
      if (el.parentElement?.tagName !== "Departments") continue;
      departments.push({
        departmentNumber: el.getAttribute("Department_Number") ?? "",
        description: text(el, "Description"),
        shiftReportFlag: flag(el, "Shift_Report_Flag"),
        salesSummaryReport: flag(el, "Sales_Summary_Report"),
        conexxusProductCode: text(el, "Conexxus_Product_Code") || null,
        essoHostDepartment: flag(el, "Esso_Host_Department"),
        loyaltyCardEligible: flag(el, "Loyalty_Card_Eligible"),
        defaultItem: text(el, "Default_Item") || null,
      });
    }

    // Price Groups
    const pgEls = root.getElementsByTagName("Price_Group");
    const priceGroups: BT9000PriceGroup[] = [];
    for (let i = 0; i < pgEls.length; i++) {
      const el = pgEls[i];
      // Only top-level price groups (under <Price_Groups>), not <Price_Group> inside items
      if (el.parentElement?.tagName !== "Price_Groups") continue;
      const qpEls = el.getElementsByTagName("Local_Quantity_Pricing");
      const quantityPricing: { quantity: number; price: number }[] = [];
      for (let j = 0; j < qpEls.length; j++) {
        quantityPricing.push({
          quantity: num(qpEls[j], "Quantity"),
          price: num(qpEls[j], "Price"),
        });
      }
      priceGroups.push({
        priceGroupNumber: el.getAttribute("Price_Group_Number") ?? "",
        englishDescription: text(el, "English_Description"),
        frenchDescription: text(el, "French_Description"),
        price: num(el, "Price"),
        quantityPricing: quantityPricing.length > 0 ? quantityPricing : null,
      });
    }

    // Items (SKUs)
    const skuEls = root.getElementsByTagName("Stock_Keeping_Unit");
    const items: BT9000Item[] = [];
    for (let i = 0; i < skuEls.length; i++) {
      const el = skuEls[i];
      const upcEls = el.getElementsByTagName("UPC");
      const upcs: string[] = [];
      for (let j = 0; j < upcEls.length; j++) {
        const val = (upcEls[j].textContent ?? "").trim();
        if (val) upcs.push(val);
      }
      // Item-level quantity pricing
      const qpEls = el.getElementsByTagName("Local_Quantity_Pricing");
      const quantityPricing: { quantity: number; price: number }[] = [];
      for (let j = 0; j < qpEls.length; j++) {
        quantityPricing.push({
          quantity: num(qpEls[j], "Quantity"),
          price: num(qpEls[j], "Price"),
        });
      }
      // Get the direct <Department> child text (not nested ones)
      const deptText = text(el, "Department");
      // Get the direct <Price_Group> child text
      const pgText = text(el, "Price_Group");

      items.push({
        itemNumber: el.getAttribute("Item_Number") ?? "",
        price: num(el, "Price"),
        englishDescription: text(el, "English_Description"),
        frenchDescription: text(el, "French_Description"),
        department: deptText,
        conexxusProductCode: text(el, "Conexxus_Product_Code") || null,
        loyaltyCardEligible: flag(el, "Loyalty_Card_Eligible"),
        tax1: flag(el, "TAX1"),
        tax2: flag(el, "TAX2"),
        upcs,
        priceGroup: pgText || null,
        itemDeposit: num(el, "Item_Deposit") || null,
        ageRequirements: num(el, "Age_Requirements") || null,
        quantityPricing: quantityPricing.length > 0 ? quantityPricing : null,
      });
    }

    // Deal Groups
    const dgEls = root.getElementsByTagName("Deal_Group");
    const dealGroups: BT9000DealGroup[] = [];
    for (let i = 0; i < dgEls.length; i++) {
      const el = dgEls[i];
      if (!el.getAttribute("Deal_Group_Number")) continue;
      const compEls = el.getElementsByTagName("Deal_Group_Component");
      const components = [];
      for (let j = 0; j < compEls.length; j++) {
        components.push({
          item: text(compEls[j], "Item") || null,
          priceGroup: text(compEls[j], "Price_Group") || null,
          quantity: num(compEls[j], "Quantity"),
          priceForQuantityOne: num(compEls[j], "Price_For_Quantity_One"),
          percentageOff: num(compEls[j], "Percentage_Off") || null,
          amountOff: num(compEls[j], "Amount_Off") || null,
        });
      }
      const fuelEl = el.getElementsByTagName("Requires_Fuel_To_Complete_Deal")[0];
      const cplEl = el.getElementsByTagName("CPL_Fuel_Discounting")[0];
      dealGroups.push({
        dealGroupNumber: el.getAttribute("Deal_Group_Number") ?? "",
        englishDescription: text(el, "English_Description"),
        frenchDescription: text(el, "French_Description"),
        components,
        requiresFuel: fuelEl
          ? { posGrade: num(fuelEl, "Required_Fuel_POS_Grade"), litres: num(fuelEl, "Required_Fuel_Litres") }
          : null,
        cplFuelDiscounting: cplEl
          ? { posGrade: num(cplEl, "POS_Grade"), cplDiscount: num(cplEl, "CPL_Discount_On_Fuel") }
          : null,
      });
    }

    // Payouts
    const payoutEls = root.getElementsByTagName("Payout");
    const payouts: BT9000Payout[] = [];
    for (let i = 0; i < payoutEls.length; i++) {
      const el = payoutEls[i];
      payouts.push({
        payoutNumber: el.getAttribute("Payout_Number") ?? "",
        englishDescription: text(el, "English_Description"),
        frenchDescription: text(el, "French_Description"),
      });
    }

    // Tender Coupons
    const tcContainer = root.getElementsByTagName("Tenders_Coupons")[0];
    const tenderCoupons: BT9000TenderCoupon[] = [];
    if (tcContainer) {
      const tcEls = tcContainer.getElementsByTagName("Item");
      for (let i = 0; i < tcEls.length; i++) {
        const el = tcEls[i];
        tenderCoupons.push({
          itemNumber: el.getAttribute("Item_Number") ?? "",
          englishDescription: text(el, "English_Description"),
          frenchDescription: text(el, "French_Description"),
        });
      }
    }

    return { metadata, departments, priceGroups, items, dealGroups, payouts, tenderCoupons };
  }

  // ---- File handling ----

  async function processFile(file: File) {
    setFileName(file.name);
    setParseError(null);
    setParsedData(null);
    setImportPhase("idle");
    setImportError(null);
    setItemsVisible(50);

    try {
      const text = await file.text();
      const data = parseBT9000XML(text);

      if (data.departments.length === 0 && data.items.length === 0) {
        throw new Error("No departments or items found. Is this a BT9000 Price Book XML file?");
      }

      setParsedData(data);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Failed to parse file");
    }
  }

  // ---- Import execution (resumable) ----

  // Track completed state so we can resume after failure
  const completedRef = useRef<{
    departments: boolean;
    departmentMap: Record<string, string>;
    priceGroups: boolean;
    priceGroupMap: Record<string, string>;
    itemBatchesDone: number; // how many batches of 500 completed
    dealGroups: boolean;
    payouts: boolean;
    tenderCoupons: boolean;
  }>({
    departments: false,
    departmentMap: {},
    priceGroups: false,
    priceGroupMap: {},
    itemBatchesDone: 0,
    dealGroups: false,
    payouts: false,
    tenderCoupons: false,
  });

  async function handleImport() {
    if (!parsedData || !fileName) return;
    setImportError(null);

    const state = completedRef.current;
    const BATCH_SIZE = 500;

    try {
      // 1. Departments (skip if already done)
      if (!state.departments) {
        setImportPhase("departments");
        setImportProgress({ current: 0, total: parsedData.departments.length, label: "Importing departments..." });
        state.departmentMap = await importDepartmentsAction(parsedData.departments);
        state.departments = true;
        setImportProgress({ current: parsedData.departments.length, total: parsedData.departments.length, label: "Departments done" });
      }

      // 2. Price Groups (skip if already done)
      if (!state.priceGroups) {
        setImportPhase("price_groups");
        setImportProgress({ current: 0, total: parsedData.priceGroups.length, label: "Importing price groups..." });
        state.priceGroupMap = await importPriceGroupsAction(parsedData.priceGroups);
        state.priceGroups = true;
        setImportProgress({ current: parsedData.priceGroups.length, total: parsedData.priceGroups.length, label: "Price groups done" });
      }

      // 3. Items in batches of 500 (resume from last completed batch)
      setImportPhase("items");
      const totalItems = parsedData.items.length;
      const totalBatches = Math.ceil(totalItems / BATCH_SIZE);
      let importedItems = state.itemBatchesDone * BATCH_SIZE;

      for (let batchIdx = state.itemBatchesDone; batchIdx < totalBatches; batchIdx++) {
        const start = batchIdx * BATCH_SIZE;
        const batch = parsedData.items.slice(start, start + BATCH_SIZE);
        setImportProgress({
          current: importedItems,
          total: totalItems,
          label: `Importing items... ${importedItems.toLocaleString()} / ${totalItems.toLocaleString()} (batch ${batchIdx + 1}/${totalBatches})`,
        });
        const count = await importItemsBatchAction(batch, state.departmentMap, state.priceGroupMap);
        importedItems += count;
        state.itemBatchesDone = batchIdx + 1;
      }
      setImportProgress({ current: importedItems, total: totalItems, label: "Items done" });

      // 4. Deal Groups (skip if already done)
      if (!state.dealGroups) {
        setImportPhase("deal_groups");
        setImportProgress({ current: 0, total: parsedData.dealGroups.length, label: "Importing deal groups..." });
        await importDealGroupsAction(parsedData.dealGroups);
        state.dealGroups = true;
      }

      // 5. Payouts (skip if already done)
      if (!state.payouts) {
        setImportPhase("payouts");
        setImportProgress({ current: 0, total: parsedData.payouts.length, label: "Importing payouts..." });
        await importPayoutsAction(parsedData.payouts);
        state.payouts = true;
      }

      // 6. Tender Coupons (skip if already done)
      if (!state.tenderCoupons) {
        setImportPhase("tender_coupons");
        setImportProgress({ current: 0, total: parsedData.tenderCoupons.length, label: "Importing tender coupons..." });
        await importTenderCouponsAction(parsedData.tenderCoupons);
        state.tenderCoupons = true;
      }

      // 7. Record import
      setImportPhase("recording");
      await recordImportAction({
        file_name: fileName,
        bt9000_version: parsedData.metadata.bt9000Version || null,
        bt9000_station_id: parsedData.metadata.stationId || null,
        file_creation_date: parsedData.metadata.fileCreationDate || null,
        departments_count: parsedData.departments.length,
        items_count: importedItems,
        price_groups_count: parsedData.priceGroups.length,
        deal_groups_count: parsedData.dealGroups.length,
        payouts_count: parsedData.payouts.length,
        tender_coupons_count: parsedData.tenderCoupons.length,
      });

      // Reset state on success
      completedRef.current = {
        departments: false, departmentMap: {},
        priceGroups: false, priceGroupMap: {},
        itemBatchesDone: 0, dealGroups: false, payouts: false, tenderCoupons: false,
      };

      setImportPhase("done");
      toast.success("BT9000 Price Book imported successfully");
    } catch (err) {
      setImportPhase("error");
      const msg = err instanceof Error ? err.message : "Import failed";
      setImportError(`${msg} — Click "Resume Import" to continue from where it stopped.`);
      toast.error("Import failed — you can resume");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteImportAction(id);
      toast.success("Import record deleted");
    } catch {
      toast.error("Delete failed");
    }
  }

  const isImporting = importPhase !== "idle" && importPhase !== "done" && importPhase !== "error";
  const progressPct = importProgress.total > 0 ? Math.round((importProgress.current / importProgress.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold mb-4">Upload BT9000 Price Book</h2>
        <p className="text-sm text-gray-500 mb-4">
          Upload the XML file exported from your Bulloch BT9000 POS system.
          This will sync departments, items, price groups, deal groups, payouts, and tender coupons.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
          }}
        />
        <div
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) processFile(file);
          }}
          onDragOver={(e) => e.preventDefault()}
          className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50"
        >
          <Upload className="h-8 w-8 text-gray-400 mb-2" />
          <span className="text-sm text-gray-500 mb-3">
            {fileName ?? "Drag & drop your BT9000 XML file here, or:"}
          </span>
          <label className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-gray-800">
            Browse Files
            <input
              type="file"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processFile(file);
              }}
            />
          </label>
          <span className="text-xs text-gray-400 mt-2">Supports BT9000 Price Book XML files</span>
        </div>
        {parseError && (
          <p className="text-sm text-red-500 mt-2">{parseError}</p>
        )}
      </div>

      {/* Import Progress */}
      {isImporting && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-3">
            <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
            <span className="font-medium text-sm">{importProgress.label}</span>
          </div>
          {importPhase === "items" && importProgress.total > 0 && (
            <>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div
                  className="bg-gray-900 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 text-right">{progressPct}%</p>
            </>
          )}
          <div className="flex gap-2 mt-3 text-xs text-gray-400">
            {(["departments", "price_groups", "items", "deal_groups", "payouts", "tender_coupons", "recording"] as ImportPhase[]).map((phase) => (
              <span
                key={phase}
                className={`px-2 py-1 rounded ${
                  importPhase === phase
                    ? "bg-gray-900 text-white"
                    : (["departments", "price_groups", "items", "deal_groups", "payouts", "tender_coupons", "recording"].indexOf(phase) <
                        ["departments", "price_groups", "items", "deal_groups", "payouts", "tender_coupons", "recording"].indexOf(importPhase))
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100"
                }`}
              >
                {phase.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Import Error — with Resume */}
      {importPhase === "error" && importError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <p>{importError}</p>
          {parsedData && (
            <Button
              onClick={handleImport}
              className="mt-3 bg-gray-900 text-white rounded-xl"
            >
              Resume Import
            </Button>
          )}
        </div>
      )}

      {/* Import Done */}
      {importPhase === "done" && parsedData && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Price Book imported successfully</p>
            <p className="mt-1">
              {parsedData.departments.length} departments, {parsedData.items.length.toLocaleString()} items,{" "}
              {parsedData.priceGroups.length} price groups, {parsedData.dealGroups.length} deal groups,{" "}
              {parsedData.payouts.length} payouts, {parsedData.tenderCoupons.length} tender coupons
            </p>
          </div>
        </div>
      )}

      {/* Preview with Tabs */}
      {parsedData && importPhase === "idle" && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">
              Preview &mdash; BT9000 v{parsedData.metadata.bt9000Version}
              <span className="text-gray-400 font-normal ml-2">
                Station {parsedData.metadata.stationId}
              </span>
            </h2>
            <Button
              onClick={handleImport}
              className="bg-gray-900 text-white rounded-xl"
            >
              Import Price Book
            </Button>
          </div>

          <Tabs defaultValue="summary">
            <TabsList className="flex-wrap">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="departments">Departments ({parsedData.departments.length})</TabsTrigger>
              <TabsTrigger value="items">Items ({parsedData.items.length.toLocaleString()})</TabsTrigger>
              <TabsTrigger value="price_groups">Price Groups ({parsedData.priceGroups.length})</TabsTrigger>
              <TabsTrigger value="deal_groups">Deal Groups ({parsedData.dealGroups.length})</TabsTrigger>
              <TabsTrigger value="payouts">Payouts ({parsedData.payouts.length})</TabsTrigger>
              <TabsTrigger value="tenders">Tenders ({parsedData.tenderCoupons.length})</TabsTrigger>
            </TabsList>

            {/* Summary Tab */}
            <TabsContent value="summary">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {[
                  { label: "Departments", value: parsedData.departments.length },
                  { label: "Items (SKUs)", value: parsedData.items.length.toLocaleString() },
                  { label: "Price Groups", value: parsedData.priceGroups.length },
                  { label: "Deal Groups", value: parsedData.dealGroups.length },
                  { label: "Payouts", value: parsedData.payouts.length },
                  { label: "Tender Coupons", value: parsedData.tenderCoupons.length },
                  { label: "BT9000 Version", value: parsedData.metadata.bt9000Version },
                  { label: "File Date", value: parsedData.metadata.fileCreationDate },
                ].map((card) => (
                  <div key={card.label} className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-medium text-gray-500 uppercase">{card.label}</p>
                    <p className="text-2xl font-semibold mt-1">{card.value}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Departments Tab */}
            <TabsContent value="departments">
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      {["Dept #", "Name", "PCATS Code", "Shift Report", "Sales Report", "Loyalty", "Esso Host"].map((col) => (
                        <th key={col} className="text-left px-3 py-2 font-medium text-gray-600">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.departments.map((d, i) => (
                      <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-1.5 font-mono text-xs">{d.departmentNumber}</td>
                        <td className="px-3 py-1.5 font-medium">{d.description}</td>
                        <td className="px-3 py-1.5 text-center">{d.conexxusProductCode ?? "—"}</td>
                        <td className="px-3 py-1.5 text-center">{d.shiftReportFlag ? "Yes" : "—"}</td>
                        <td className="px-3 py-1.5 text-center">{d.salesSummaryReport ? "Yes" : "—"}</td>
                        <td className="px-3 py-1.5 text-center">{d.loyaltyCardEligible ? "Yes" : "—"}</td>
                        <td className="px-3 py-1.5 text-center">{d.essoHostDepartment ? "Yes" : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* Items Tab */}
            <TabsContent value="items">
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      {["Item #", "Description", "Price", "Dept", "UPC", "Tax", "Deposit", "Age"].map((col) => (
                        <th key={col} className="text-left px-3 py-2 font-medium text-gray-600">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.items.slice(0, itemsVisible).map((item, i) => (
                      <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-1.5 font-mono text-xs">{item.itemNumber}</td>
                        <td className="px-3 py-1.5">{item.englishDescription}</td>
                        <td className="px-3 py-1.5 text-right">${item.price.toFixed(2)}</td>
                        <td className="px-3 py-1.5 font-mono text-xs">{item.department}</td>
                        <td className="px-3 py-1.5 font-mono text-xs">{item.upcs[0] ?? "—"}</td>
                        <td className="px-3 py-1.5 text-xs">
                          {[item.tax1 && "T1", item.tax2 && "T2"].filter(Boolean).join(", ") || "—"}
                        </td>
                        <td className="px-3 py-1.5 text-right">{item.itemDeposit ? `$${item.itemDeposit.toFixed(2)}` : "—"}</td>
                        <td className="px-3 py-1.5 text-center">{item.ageRequirements ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.items.length > itemsVisible && (
                  <button
                    onClick={() => setItemsVisible((v) => v + 100)}
                    className="mt-3 text-sm text-gray-500 hover:text-gray-900 underline"
                  >
                    Show more ({parsedData.items.length - itemsVisible} remaining)
                  </button>
                )}
              </div>
            </TabsContent>

            {/* Price Groups Tab */}
            <TabsContent value="price_groups">
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      {["Group #", "Description (EN)", "Description (FR)", "Price", "Qty Pricing"].map((col) => (
                        <th key={col} className="text-left px-3 py-2 font-medium text-gray-600">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.priceGroups.map((pg, i) => (
                      <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-1.5 font-mono text-xs">{pg.priceGroupNumber}</td>
                        <td className="px-3 py-1.5">{pg.englishDescription}</td>
                        <td className="px-3 py-1.5 text-gray-500">{pg.frenchDescription}</td>
                        <td className="px-3 py-1.5 text-right">${pg.price.toFixed(2)}</td>
                        <td className="px-3 py-1.5 text-xs">
                          {pg.quantityPricing
                            ? pg.quantityPricing.map((qp) => `${qp.quantity} for $${qp.price.toFixed(2)}`).join(", ")
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* Deal Groups Tab */}
            <TabsContent value="deal_groups">
              <div className="space-y-4 mt-4">
                {parsedData.dealGroups.map((dg, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-sm">{dg.englishDescription} ({dg.dealGroupNumber})</h3>
                    {dg.requiresFuel && (
                      <p className="text-xs text-gray-500 mt-1">
                        Requires {dg.requiresFuel.litres}L of Grade {dg.requiresFuel.posGrade}
                      </p>
                    )}
                    {dg.cplFuelDiscounting && (
                      <p className="text-xs text-gray-500">
                        CPL Discount: {dg.cplFuelDiscounting.cplDiscount}¢/L on Grade {dg.cplFuelDiscounting.posGrade}
                      </p>
                    )}
                    {dg.components.length > 0 && (
                      <table className="w-full text-sm mt-2">
                        <thead>
                          <tr>
                            <th className="text-left px-2 py-1 text-xs font-medium text-gray-500">Item/Group</th>
                            <th className="text-right px-2 py-1 text-xs font-medium text-gray-500">Qty</th>
                            <th className="text-right px-2 py-1 text-xs font-medium text-gray-500">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dg.components.map((c, ci) => (
                            <tr key={ci} className="border-t border-gray-200">
                              <td className="px-2 py-1 font-mono text-xs">{c.item ?? c.priceGroup ?? "—"}</td>
                              <td className="px-2 py-1 text-right">{c.quantity}</td>
                              <td className="px-2 py-1 text-right">${c.priceForQuantityOne.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                ))}
                {parsedData.dealGroups.length === 0 && (
                  <p className="text-sm text-gray-500">No deal groups in this file.</p>
                )}
              </div>
            </TabsContent>

            {/* Payouts Tab */}
            <TabsContent value="payouts">
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      {["Payout #", "Description (EN)", "Description (FR)"].map((col) => (
                        <th key={col} className="text-left px-3 py-2 font-medium text-gray-600">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.payouts.map((p, i) => (
                      <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-1.5 font-mono text-xs">{p.payoutNumber}</td>
                        <td className="px-3 py-1.5">{p.englishDescription}</td>
                        <td className="px-3 py-1.5 text-gray-500">{p.frenchDescription}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* Tenders Tab */}
            <TabsContent value="tenders">
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      {["Item #", "Description (EN)", "Description (FR)"].map((col) => (
                        <th key={col} className="text-left px-3 py-2 font-medium text-gray-600">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.tenderCoupons.map((tc, i) => (
                      <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-1.5 font-mono text-xs">{tc.itemNumber}</td>
                        <td className="px-3 py-1.5">{tc.englishDescription}</td>
                        <td className="px-3 py-1.5 text-gray-500">{tc.frenchDescription}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Import History */}
      {importHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold mb-4">Import History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {["File", "Version", "Station", "Depts", "Items", "Price Grps", "Deals", "Payouts", "Tenders", "Status", "Imported", ""].map((col) => (
                    <th key={col} className="text-left px-3 py-2 font-medium text-gray-600">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {importHistory.map((h) => (
                  <tr key={h.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 text-xs max-w-[150px] truncate">{h.file_name}</td>
                    <td className="px-3 py-2 text-xs">{h.bt9000_version ?? "—"}</td>
                    <td className="px-3 py-2 text-xs">{h.bt9000_station_id ?? "—"}</td>
                    <td className="px-3 py-2 text-right">{h.departments_count}</td>
                    <td className="px-3 py-2 text-right">{h.items_count.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">{h.price_groups_count}</td>
                    <td className="px-3 py-2 text-right">{h.deal_groups_count}</td>
                    <td className="px-3 py-2 text-right">{h.payouts_count}</td>
                    <td className="px-3 py-2 text-right">{h.tender_coupons_count}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        h.status === "completed" ? "bg-green-100 text-green-700" : h.status === "failed" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">{new Date(h.imported_at).toLocaleDateString()}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleDelete(h.id)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
