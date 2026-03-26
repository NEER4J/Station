"use client";

import { createContext, useContext } from "react";
import type { RoleName } from "@/lib/auth/roles";

interface StationContextType {
  stationId: string | null;
  stationName: string | null;
  userRole: RoleName | null;
}

const StationContext = createContext<StationContextType>({
  stationId: null,
  stationName: null,
  userRole: null,
});

export function StationProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: StationContextType;
}) {
  return (
    <StationContext.Provider value={value}>{children}</StationContext.Provider>
  );
}

export function useStation() {
  return useContext(StationContext);
}
