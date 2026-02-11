"use client";

import { useState, useTransition } from "react";
import { exportDataAction } from "@/lib/actions/export";
import { Download } from "lucide-react";

export function DataExportButton() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleExport() {
    setError(null);
    startTransition(async () => {
      const result = await exportDataAction();

      if (result.status === "error") {
        setError(result.error);
        return;
      }

      // Download as JSON
      const json = JSON.stringify(result.data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ember-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  return (
    <div>
      <button
        onClick={handleExport}
        disabled={isPending}
        className="flex items-center gap-2 rounded-xl border border-ember-border px-4 py-2.5 text-sm font-medium text-ember-text-secondary transition-colors hover:border-ember-amber/30 hover:text-ember-text disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        {isPending ? "Exporting..." : "Export All Data (JSON)"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-ember-error">{error}</p>
      )}
    </div>
  );
}
