import { TankGauge } from "@/components/shared/tank-gauge";
import type { TankStatus } from "@/types/database";

interface TankGaugesSectionProps {
  tanks: TankStatus[];
}

export function TankGaugesSection({ tanks }: TankGaugesSectionProps) {
  if (tanks.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        Tank Levels
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tanks.map((t) => (
          <TankGauge
            key={t.tank.id}
            tankNumber={t.tank.tank_number}
            gradeName={t.tank.fuel_grade?.name ?? "Unknown"}
            gradeColor={t.tank.fuel_grade?.color ?? "#6b7280"}
            currentVolume={t.latest_reading ? Number(t.latest_reading.volume_litres) : 0}
            capacity={Number(t.tank.capacity_litres)}
            isLow={t.is_low}
          />
        ))}
      </div>
    </div>
  );
}
