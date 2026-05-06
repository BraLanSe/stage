"use client";

import { printFatura } from "@/shared/utils/fatura-print";

const PrinterIcon = () => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className="h-3.5 w-3.5"
    aria-hidden="true"
  >
    <path d="M5 4v3H3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h2v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2h2a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-2V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1z" />
  </svg>
);

interface PrintActionProps {
  id: number;
  label?: string;
  className?: string;
}

export function PrintAction({ id, label = "PDF", className }: PrintActionProps) {
  return (
    <button
      type="button"
      onClick={() => printFatura(id)}
      title="Exportar PDF"
      className={
        className ??
        "flex items-center gap-1.5 rounded border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
      }
    >
      <PrinterIcon />
      {label}
    </button>
  );
}
