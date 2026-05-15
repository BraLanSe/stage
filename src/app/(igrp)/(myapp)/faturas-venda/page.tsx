/* IGRP-GENERATED-PAGE */
"use client";

import {
  IGRPAlert,
  IGRPBadge,
  IGRPButton,
  IGRPContainer,
  IGRPTable,
} from "@igrp/igrp-framework-react-design-system";
import Link from "next/link";
import { useState } from "react";
import type { FaturaVendaReadDTO } from "@/app/(myapp)/types/efatura";
import { useFaturasVenda } from "@/hooks/use-faturas-venda";
import { API_BASE } from "@/lib/api/client";

// ── Helpers ──────────────────────────────────────────────────

function formatCVE(value?: number) {
  if (value === undefined || value === null) return "—";
  return new Intl.NumberFormat("pt-CV", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Ações Menu ───────────────────────────────────────────────

function AcoesMenu({ id }: { id?: number }) {
  const [open, setOpen] = useState(false);

  function handlePrint() {
    if (id == null) return;
    window.open(`${API_BASE}/faturas-venda/${id}/pdf`, "_blank");
    setOpen(false);
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
      >
        Ações
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Fechar menu"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-1 w-44 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
            <Link
              href={`/faturas-venda/${id}`}
              className="block px-4 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              Ver / Editar
            </Link>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50"
              onClick={handlePrint}
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M5 4v3H3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h2v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2h2a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-2V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1z" />
              </svg>
              Imprimir PDF
            </button>
            <button
              type="button"
              className="block w-full px-4 py-1.5 text-left text-xs text-red-600 hover:bg-red-50"
              onClick={() => setOpen(false)}
            >
              Eliminar
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────

export default function FaturasVendaPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, isError, error } = useFaturasVenda(page, 10);

  const totalElements = data?.totalElements ?? 0;
  const from = totalElements === 0 ? 0 : page * 10 + 1;
  const to = Math.min(page * 10 + (data?.content?.length ?? 0), totalElements);
  const faturas = (data?.content ?? []) as FaturaVendaReadDTO[];

  return (
    <IGRPContainer id="faturas-venda" name="faturas-venda" tag="faturas-venda" className="flex flex-col gap-0 p-0">
      <IGRPButton name="force-studio" tag="force-studio" id="force-studio" className="sr-only">FORCE</IGRPButton>
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white px-6 py-2.5">
        <nav className="flex items-center gap-1 text-xs text-gray-500">
          <Link href="/" className="hover:text-gray-700">
            Página Inicial
          </Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">Fatura</span>
        </nav>
      </div>

      <div className="p-5">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4 text-blue-500"
                aria-hidden="true"
              >
                <line x1="4" y1="5" x2="16" y2="5" />
                <line x1="4" y1="10" x2="16" y2="10" />
                <line x1="4" y1="15" x2="16" y2="15" />
              </svg>
              <h1 className="text-sm font-semibold text-gray-800">
                Lista de Fatura
              </h1>
            </div>
            {totalElements > 0 && (
              <span className="text-xs text-gray-500">
                A exibir {from}-{to} de {totalElements} itens.
              </span>
            )}
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-2.5">
            <div className="flex h-7 items-center rounded-full border border-gray-300 bg-white px-2.5 focus-within:ring-1 focus-within:ring-blue-400">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-3.5 w-3.5 text-gray-400"
                aria-hidden="true"
              >
                <circle cx="8" cy="8" r="5" />
                <path d="M18 18l-4-4" />
              </svg>
              <input
                placeholder=""
                className="ml-1.5 w-32 bg-transparent text-xs focus:outline-none"
              />
            </div>

            <div className="ml-auto flex items-center gap-1.5">
              <Link
                href="/faturas-venda/nova"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                title="Nova Fatura"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <line x1="10" y1="5" x2="10" y2="15" />
                  <line x1="5" y1="10" x2="15" y2="10" />
                </svg>
              </Link>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                title="Actualizar"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path d="M4 12a8 8 0 0 1 13.66-4.24M16 4v4h-4" />
                  <path d="M16 8a8 8 0 0 1-13.66 4.24M4 16v-4h4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Table */}
          {isError && (
            <div className="px-5 pt-4">
              <IGRPAlert variant="soft" color="destructive">
                {(error as Error)?.message ?? "Falha ao carregar as faturas de venda"}
              </IGRPAlert>
            </div>
          )}

          {!isError && (
            <IGRPTable
              id="faturas-venda-table"
              tag="table-faturas-venda"
              content={isLoading ? [] : faturas}
              columns={[
                {
                  header: "Nº Documento",
                  accessorKey: "codigo",
                  render: (v) => String(v ?? "—"),
                },
                {
                  header: "Cliente",
                  accessorKey: "cliente",
                  render: (v) =>
                    (v as FaturaVendaReadDTO["cliente"] | null)?.desig ?? "—",
                },
                {
                  header: "Data Vencimento",
                  accessorKey: "dtVencimentoFatura",
                  render: (v) => formatDate(v as string | undefined),
                },
                {
                  header: "Valor Fatura",
                  accessorKey: "valorFatura",
                  render: (v) => formatCVE(v as number | undefined),
                },
                {
                  header: "Valor Pago",
                  accessorKey: "valorPago",
                  render: (v) => formatCVE(v as number | undefined),
                },
                {
                  header: "Pagamento",
                  accessorKey: "pago",
                  render: (v) => (
                    <IGRPBadge color={(v as boolean) ? "success" : "warning"}>
                      {(v as boolean) ? "Pago" : "Não Pago"}
                    </IGRPBadge>
                  ),
                },
                {
                  header: "Estado",
                  accessorKey: "estado",
                  render: (v) => (
                    <IGRPBadge color={(v as string) === "CONFIRMADO" ? "success" : "secondary"}>
                      {(v as string) === "CONFIRMADO" ? "Confirmado" : "Rascunho"}
                    </IGRPBadge>
                  ),
                },
              ]}
              actions={(row) => <AcoesMenu id={row.original.id} />}
            />
          )}

          {/* Pagination */}
          {data && data.totalElements > 0 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-5 py-2.5 text-xs text-gray-500">
              <span>
                Pág. {data.number + 1} de {Math.max(data.totalPages, 1)}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={data.first}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded border border-gray-300 px-2.5 py-1 hover:bg-gray-50 disabled:opacity-40"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={data.last}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded border border-gray-300 px-2.5 py-1 hover:bg-gray-50 disabled:opacity-40"
                >
                  Seguinte
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </IGRPContainer>
  );
}
