"use client";

import type { BatchPost } from "@/types/database";
import { PageHeader } from "@/components/shared/page-header";
import { BatchPostsTable } from "./batch-posts-table";

interface BatchPostsClientProps {
  initialData: BatchPost[];
}

export function BatchPostsClient({ initialData }: BatchPostsClientProps) {
  return (
    <>
      <PageHeader
        title="Batch Posts"
        subtitle="Audit ledger of all batch inventory commits"
      />

      <BatchPostsTable data={initialData} />
    </>
  );
}
