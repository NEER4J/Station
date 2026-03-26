import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface TankGaugeProps {
  tankNumber: string;
  gradeName: string;
  gradeColor: string;
  currentVolume: number;
  capacity: number;
  isLow?: boolean;
  className?: string;
}

export function TankGauge({
  tankNumber,
  gradeName,
  gradeColor,
  currentVolume,
  capacity,
  isLow = false,
  className,
}: TankGaugeProps) {
  const fillPercentage = Math.min(Math.round((currentVolume / capacity) * 100), 100);

  return (
    <div
      className={cn(
        "rounded-xl bg-white shadow-sm p-5 flex flex-col items-center gap-4",
        className,
      )}
    >
      <div className="text-center">
        <h3 className="text-sm font-semibold text-gray-900">Tank {tankNumber}</h3>
        <p className="text-xs text-gray-500">{gradeName}</p>
      </div>

      {/* Gauge container */}
      <div className="relative flex h-40 w-20 items-end rounded-lg bg-gray-100 overflow-hidden">
        <div
          className="w-full rounded-b-lg transition-all duration-700 ease-out"
          style={{
            height: `${fillPercentage}%`,
            backgroundColor: isLow ? "#ef4444" : gradeColor,
          }}
        />
        {/* Percentage overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              "text-lg font-bold",
              fillPercentage > 50 ? "text-white" : "text-gray-700",
            )}
          >
            {fillPercentage}%
          </span>
        </div>
      </div>

      {/* Volume info */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-900">
          {currentVolume.toLocaleString()} L
        </p>
        <p className="text-xs text-gray-400">
          of {capacity.toLocaleString()} L
        </p>
      </div>

      {isLow && (
        <div className="flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
          <AlertTriangle className="h-3 w-3" />
          Low Level
        </div>
      )}
    </div>
  );
}
