import React from "react";

import { APP_CONFIG } from "@/config/app-config";

const DashboardPage = () => {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Overview</h1>
      <p className="max-w-2xl text-sm text-gray-600 dark:text-gray-400">
        {APP_CONFIG.name} — {APP_CONFIG.meta.description}
      </p>
    </div>
  );
};

export default DashboardPage;