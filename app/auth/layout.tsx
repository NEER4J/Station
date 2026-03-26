import { ReactNode } from "react";

import { Gauge } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { APP_CONFIG } from "@/config/app-config";

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main>
      <div className="grid h-dvh justify-center p-2 lg:grid-cols-2">
        <div className="relative order-2 hidden h-full overflow-hidden rounded-3xl bg-gray-900 lg:flex">
          <div className="relative z-10 flex w-full flex-col">
            <div className="absolute top-10 space-y-2 px-10 text-white">
              <Gauge className="size-10" aria-hidden />
              <h1 className="text-2xl font-medium">{APP_CONFIG.name}</h1>
              <p className="text-sm font-medium text-white/90">{APP_CONFIG.tagline}</p>
              <p className="max-w-md text-sm text-white/80">{APP_CONFIG.meta.description}</p>
            </div>

            <div className="absolute bottom-10 flex w-full justify-between px-10">
              <div className="flex-1 space-y-1 text-white">
                <h2 className="font-medium">{"Inventory & sales"}</h2>
                <p className="text-sm text-white/80">
                  Track wet stock, retail, and margins from one place—built for busy forecourts and back offices.
                </p>
              </div>
              <Separator orientation="vertical" className="mx-3 !h-auto bg-white/20" />
              <div className="flex-1 space-y-1 text-white">
                <h2 className="font-medium">Profits in real time</h2>
                <p className="text-sm text-white/80">
                  See performance as it happens so you can reorder, price, and adjust without waiting for month-end reports.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative order-1 flex h-full">{children}</div>
      </div>
    </main>
  );
}
