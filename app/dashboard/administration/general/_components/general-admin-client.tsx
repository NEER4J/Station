"use client";

import type { Station, Tax, AdminOption } from "@/types/database";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralTab } from "./general-tab";
import { TaxesTab } from "./taxes-tab";
import { OptionsTab } from "./options-tab";

interface Props {
  station: Station | null;
  taxes: Tax[];
  adminOptions: AdminOption[];
  updateStationAction: (data: Record<string, unknown>) => Promise<void>;
  createTaxAction: (data: Record<string, unknown>) => Promise<void>;
  updateTaxAction: (id: string, data: Record<string, unknown>) => Promise<void>;
  deleteTaxAction: (id: string) => Promise<void>;
  upsertOptionAction: (key: string, value: string) => Promise<void>;
  deleteOptionAction: (id: string) => Promise<void>;
}

export function GeneralAdminClient({
  station,
  taxes,
  adminOptions,
  updateStationAction,
  createTaxAction,
  updateTaxAction,
  deleteTaxAction,
  upsertOptionAction,
  deleteOptionAction,
}: Props) {
  return (
    <Tabs defaultValue="general">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="taxes">Taxes</TabsTrigger>
        <TabsTrigger value="options">Options</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <GeneralTab
          station={station}
          updateStationAction={updateStationAction}
        />
      </TabsContent>

      <TabsContent value="taxes">
        <TaxesTab
          taxes={taxes}
          createTaxAction={createTaxAction}
          updateTaxAction={updateTaxAction}
          deleteTaxAction={deleteTaxAction}
        />
      </TabsContent>

      <TabsContent value="options">
        <OptionsTab
          adminOptions={adminOptions}
          upsertOptionAction={upsertOptionAction}
          deleteOptionAction={deleteOptionAction}
        />
      </TabsContent>
    </Tabs>
  );
}
