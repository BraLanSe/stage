"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useClientes } from "@/hooks/use-cadastro";
import { faturasVendaApi } from "@/lib/api/faturas-venda";

// ── Helpers ───────────────────────────────────────────────────

function formatCVE(value?: number) {
  if (value == null) return "—";
  return (
    new Intl.NumberFormat("pt-CV", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + " ECV"
  );
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const ESTADO_STYLE: Record<string, string> = {
  CONFIRMADO: "bg-emerald-100 text-emerald-800 border border-emerald-300",
  RASCUNHO: "bg-amber-100 text-amber-800 border border-amber-300",
  ANULADO: "bg-red-100 text-red-800 border border-red-300",
};

const ESTADO_LABEL: Record<string, string> = {
  CONFIRMADO: "Confirmado",
  RASCUNHO: "Rascunho",
  ANULADO: "Anulado",
};

// ── Page ─────────────────────────────────────────────────────

export default function RelatorioVendasPage() {
  const [dtInicio, setDtInicio] = useState("");
  const [dtFim, setDtFim] = useState("");
  const [clienteId, setClienteId] = useState<number | "">("");
  const [page, setPage] = useState(0);

  const { data: clientesPage } = useClientes(0, 100);
  const clientes = clientesPage?.content ?? [];

  const filterParams: Record<string, string> = {};
  if (dtInicio) filterParams.dtInicio = dtInicio;
  if (dtFim) filterParams.dtFim = dtFim;
  if (clienteId !== "") filterParams.clienteId = String(clienteId);

  const hasFilters = Object.keys(filterParams).length > 0;

  const { data, isLoading } = useQuery({
    queryKey: ["faturas-venda", "reports", page, dtInicio, dtFim, clienteId],
    queryFn: () => faturasVendaApi.listar(page, 20, hasFilters ? filterParams : undefined),
  });

  const faturas = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  function handleReset() {
    setDtInicio("");
    setDtFim("");
    setClienteId("");
    setPage(0);
  }

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-gray-800">Relatório de Vendas</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Filtrar e analisar faturas de venda por período e cliente
        </p>
      </div>

      {/* Filter bar */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Data De</label>
            <input
              type="date"
              value={dtInicio}
              onChange={(e) => { setDtInicio(e.target.value); setPage(0); }}
              className="h-8 rounded border border-gray-300 bg-white px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Data Até</label>
            <input
              type="date"
              value={dtFim}
              onChange={(e) => { setDtFim(e.target.value); setPage(0); }}
              className="h-8 rounded border border-gray-300 bg-white px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Cliente</label>
            <select
              value={clienteId}
              onChange={(e) => { setClienteId(e.target.value ? Number(e.target.value) : ""); setPage(0); }}
              className="h-8 rounded border border-gray-300 bg-white px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="">Todos os clientes</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.desig}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleReset}
              className="h-8 rounded border border-gray-300 px-4 text-xs text-gray-600 hover:bg-gray-50"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Summary row */}
      <div className="text-xs text-gray-500">
        {isLoading
          ? "A carregar..."
          : `${totalElements} fatura(s) encontrada(s)`}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-xs">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Nº Documento</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Cliente</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Data Emissão</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Data Vencimento</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Valor (ECV)</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Estado</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400">
                    A carregar…
                  </td>
                </tr>
              ) : faturas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400">
                    Nenhuma fatura encontrada
                  </td>
                </tr>
              ) : (
                faturas.map((f) => (
                  <tr
                    key={f.id}
                    className="border-b border-gray-100 hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-2.5 font-medium text-blue-600">
                      {f.numero ?? f.codigo ?? `FT${f.id}`}
                    </td>
                    <td className="px-4 py-2.5 text-gray-700">
                      {f.clienteNome ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">
                      {formatDate(f.dataEmissao)}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">
                      {formatDate(f.dataVencimento)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-gray-800">
                      {formatCVE(f.valorFatura ?? f.total)}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {f.estado && (
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                            ESTADO_STYLE[f.estado] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {ESTADO_LABEL[f.estado] ?? f.estado}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <Link
                        href={`/faturas-venda/${f.id}`}
                        className="text-blue-500 hover:underline"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <span className="text-xs text-gray-500">
              Página {page + 1} de {totalPages}
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded border border-gray-300 px-3 py-1 text-xs disabled:opacity-40 hover:bg-gray-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="rounded border border-gray-300 px-3 py-1 text-xs disabled:opacity-40 hover:bg-gray-50"
              >
                Próximo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
