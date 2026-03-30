"use client";

import { useState, useTransition } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import type { ParsedDipRow } from "@/types/database";
import { Button } from "@/components/ui/button";

interface FuelTankImportClientProps {
  stationId: string;
  importAction: (rows: ParsedDipRow[]) => Promise<{ inserted: number; skipped: number }>;
}

export function FuelTankImportClient({
  stationId: _stationId,
  importAction,
}: FuelTankImportClientProps) {
  const [parsedRows, setParsedRows] = useState<ParsedDipRow[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParseError(null);
    setParsedRows(null);
    setResultMessage(null);

    const buffer = await file.arrayBuffer();
    const { read, utils } = await import("xlsx");
    const workbook = read(buffer, { type: "array" });

    const sheetName = workbook.SheetNames.find(
      (n) => n.trim().toUpperCase() === "FUEL TANK DIP",
    );
    if (!sheetName) {
      setParseError(
        'Sheet named "FUEL TANK DIP" not found. Please check your Excel file.',
      );
      return;
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
    });

    const parsed: ParsedDipRow[] = rows.map((row) => ({
      site_id: String(row["SITEID"] ?? ""),
      date: String(row["DATE"] ?? ""),
      time: String(row["TIME"] ?? ""),
      tank_no: String(row["TNKNO"] ?? ""),
      product: String(row["PRODUCT"] ?? ""),
      litres_tc: Number(row["LITRESTC"] ?? 0),
      litres_gross: Number(row["LITRESG"] ?? 0),
      ullage: Number(row["ULLAGE"] ?? 0),
      dip: Number(row["DIP"] ?? 0),
      water: Number(row["WATER"] ?? 0),
      temp: Number(row["TEMP"] ?? 0),
    }));

    setParsedRows(parsed);
  }

  function handleSubmit() {
    if (!parsedRows) return;
    startTransition(async () => {
      try {
        const result = await importAction(parsedRows);
        setResultMessage(
          `Import complete: ${result.inserted} readings inserted, ${result.skipped} skipped (tank not found).`,
        );
        setParsedRows(null);
        setFileName(null);
        toast.success("Fuel dip imported successfully");
      } catch {
        toast.error("Import failed. Please try again.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* File Upload Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold mb-4">Upload Excel File</h2>
        <p className="text-sm text-gray-500 mb-4">
          Upload a .xlsx file with worksheet named &ldquo;FUEL TANK DIP&rdquo;.
          Required columns: SITEID, DATE, TIME, TNKNO, PRODUCT, LITRESTC,
          LITRESG, ULLAGE, DIP, WATER, TEMP
        </p>
        {/* File input - styled as drop zone */}
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 hover:bg-gray-50">
          <Upload className="h-8 w-8 text-gray-400 mb-2" />
          <span className="text-sm text-gray-500">
            {fileName ?? "Click to select .xlsx file"}
          </span>
          <input
            type="file"
            className="hidden"
            accept=".xlsx"
            onChange={handleFileChange}
          />
        </label>
        {parseError && (
          <p className="text-sm text-red-500 mt-2">{parseError}</p>
        )}
      </div>

      {/* Preview Table (when rows parsed) */}
      {parsedRows && parsedRows.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">
              Preview ({parsedRows.length} rows)
            </h2>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="bg-gray-900 text-white rounded-xl"
            >
              {isPending ? "Submitting..." : "Submit Fuel Dip"}
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {[
                    "SITEID",
                    "DATE",
                    "TIME",
                    "TNKNO",
                    "PRODUCT",
                    "LITRESTC",
                    "LITRESG",
                    "ULLAGE",
                    "DIP",
                    "WATER",
                    "TEMP",
                  ].map((col) => (
                    <th
                      key={col}
                      className="text-left px-3 py-2 font-medium text-gray-600"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedRows.slice(0, 50).map((row, i) => (
                  <tr
                    key={i}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-3 py-1.5 font-mono text-xs">
                      {row.site_id}
                    </td>
                    <td className="px-3 py-1.5">{row.date}</td>
                    <td className="px-3 py-1.5">{row.time}</td>
                    <td className="px-3 py-1.5 font-medium">{row.tank_no}</td>
                    <td className="px-3 py-1.5">{row.product}</td>
                    <td className="px-3 py-1.5 text-right">{row.litres_tc}</td>
                    <td className="px-3 py-1.5 text-right">
                      {row.litres_gross}
                    </td>
                    <td className="px-3 py-1.5 text-right">{row.ullage}</td>
                    <td className="px-3 py-1.5 text-right">{row.dip}</td>
                    <td className="px-3 py-1.5 text-right">{row.water}</td>
                    <td className="px-3 py-1.5 text-right">{row.temp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedRows.length > 50 && (
              <p className="text-xs text-gray-400 mt-2">
                Showing first 50 of {parsedRows.length} rows
              </p>
            )}
          </div>
        </div>
      )}

      {resultMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
          {resultMessage}
        </div>
      )}
    </div>
  );
}
