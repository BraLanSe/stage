"use client";

import { useState } from "react";
import Link from "next/link";
import { useFaturasCompra } from "@/hooks/use-faturas-compra";
import type {
  DocFiscalStatus,
  FaturaCompra,
  PagamentoStatus,
} from "@/app/(myapp)/types/efatura";

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

function PagamentoBadge({ status }: { status?: PagamentoStatus }) {
  if (!status) return null;
  const styles: Record<PagamentoStatus, string> = {
    NAO_PROCESSADO: "bg-amber-100 text-amber-800 border border-amber-300",
    PROCESSADO:     "bg-emerald-100 text-emerald-800 border border-emerald-300",
    PARCIAL:        "bg-blue-100 text-blue-800 border border-blue-300",
  };
  const labels: Record<PagamentoStatus, string> = {
    NAO_PROCESSADO: "Não Processado",
    PROCESSADO:     "Processado",
    PARCIAL:        "Parcial",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function DocFiscalBadge({ status }: { status?: DocFiscalStatus }) {
  if (!status || status === "NAO_ENVIADO") return null;
  const styles: Record<Exclude<DocFiscalStatus, "NAO_ENVIADO">, string> = {
    VALIDADO: "bg-emerald-500 text-white",
    RECUSADO: "bg-red-500 text-white",
    PENDENTE: "bg-gray-400 text-white",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${styles[status]}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function AcoesMenu({ id }: { id?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
      >
        Ações
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-40 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
            <Link
              href={`/faturas-compra/${id}`}
              className="block px-4 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              Ver / Editar
            </Link>
            <button
              className="block w-full px-4 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              Imprimir PDF
            </button>
            <button
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

function FaturasTable({ faturas }: { faturas: FaturaCompra[] }) {
  if (faturas.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-sm font-medium text-gray-700">Nenhuma fatura encontrada</p>
        <p className="text-xs text-gray-400">Crie a sua primeira fatura de compra.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="w-10 px-3 py-2 text-center font-medium text-gray-500">#</th>
            <th className="w-8 px-2 py-2">
              <input type="checkbox" className="rounded border-gray-300" />
            </th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Nº Documento</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Fornecedor</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Data Vencimento</th>
            <th className="px-3 py-2 text-right font-medium text-gray-600">Valor da fatura</th>
            <th className="px-3 py-2 text-right font-medium text-gray-600">Valor pago</th>
            <th className="px-3 py-2 text-center font-medium text-gray-600">Pagamento</th>
            <th className="px-3 py-2 text-center font-medium text-gray-600">Doc. Fiscais Eletronico</th>
            <th className="px-3 py-2 text-center font-medium text-gray-600">Ações</th>
          </tr>
          <tr className="border-b border-gray-200 bg-white">
            <td className="px-3 py-1" />
            <td className="px-2 py-1" />
            <td className="px-3 py-1">
              <input className="w-full rounded border border-gray-200 px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
            </td>
            <td className="px-3 py-1">
              <select className="w-full rounded border border-gray-200 px-2 py-0.5 text-xs focus:outline-none">
                <option value=""></option>
              </select>
            </td>
            <td className="px-3 py-1">
              <div className="flex items-center rounded border border-gray-200 bg-white px-2 py-0.5">
                <input type="date" className="w-full text-xs focus:outline-none" />
              </div>
            </td>
            <td className="px-3 py-1">
              <input className="w-full rounded border border-gray-200 px-2 py-0.5 text-xs focus:outline-none" />
            </td>
            <td className="px-3 py-1">
              <input className="w-full rounded border border-gray-200 px-2 py-0.5 text-xs focus:outline-none" />
            </td>
            <td className="px-3 py-1">
              <select className="w-full rounded border border-gray-200 px-2 py-0.5 text-xs focus:outline-none">
                <option value=""></option>
              </select>
            </td>
            <td className="px-3 py-1">
              <select className="w-full rounded border border-gray-200 px-2 py-0.5 text-xs focus:outline-none">
                <option value=""></option>
              </select>
            </td>
            <td className="px-3 py-1" />
          </tr>
        </thead>
        <tbody>
          {faturas.map((f, idx) => (
            <tr key={f.id} className="border-b border-red-100 bg-red-50/60 hover:bg-red-50">
              <td className="px-3 py-2.5 text-center text-gray-500">{idx + 1}</td>
              <td className="px-2 py-2.5">
                <input type="checkbox" className="rounded border-gray-300" />
              </td>
              <td className="px-3 py-2.5">
                <Link
                  href={`/faturas-compra/${f.id}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {f.numero ?? `#${f.id}`}
                </Link>
              </td>
              <td className="px-3 py-2.5 text-gray-700">{f.fornecedorNome ?? `Fornecedor ${f.fornecedorId}`}</td>
              <td className="px-3 py-2.5 text-gray-600">{formatDate(f.dataVencimento)}</td>
              <td className="px-3 py-2.5 text-right font-medium text-gray-800">
                {formatCVE(f.total)}
              </td>
              <td className="px-3 py-2.5 text-right text-gray-600">
                {formatCVE(0)}
              </td>
              <td className="px-3 py-2.5 text-center">
                <PagamentoBadge status="NAO_PROCESSADO" />
              </td>
              <td className="px-3 py-2.5 text-center">
                <DocFiscalBadge status={undefined} />
              </td>
              <td className="px-3 py-2.5 text-center">
                <AcoesMenu id={f.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function FaturasCompraPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, isError, error } = useFaturasCompra(page, 10);

  const totalElements = data?.totalElements ?? 0;
  const from = totalElements === 0 ? 0 : page * 10 + 1;
  const to = Math.min(page * 10 + (data?.content.length ?? 0), totalElements);

  return (
    <div className="flex flex-col gap-0 p-0">
      <div className="border-b border-gray-200 bg-white px-6 py-2.5">
        <nav className="flex items-center gap-1 text-xs text-gray-500">
          <Link href="/" className="hover:text-gray-700">Página Inicial</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">Fatura de Compra</span>
        </nav>
      </div>

      <div className="p-5">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 text-blue-500">
                <line x1="4" y1="5" x2="16" y2="5" />
                <line x1="4" y1="10" x2="16" y2="10" />
                <line x1="4" y1="15" x2="16" y2="15" />
              </svg>
              <h1 className="text-sm font-semibold text-gray-800">Lista de Fatura de Compra</h1>
            </div>
            {totalElements > 0 && (
              <span className="text-xs text-gray-500">
                A exibir {from}-{to} de {totalElements} itens.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-2.5">
            <div className="flex h-7 items-center rounded-full border border-gray-300 bg-white px-2.5 focus-within:ring-1 focus-within:ring-blue-400">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5 text-gray-400">
                <circle cx="8" cy="8" r="5" />
                <path d="M18 18l-4-4" />
              </svg>
              <input placeholder="" className="ml-1.5 w-32 bg-transparent text-xs focus:outline-none" />
            </div>
            <div className="flex h-7 items-center rounded-full border border-gray-300 bg-white px-2.5 gap-1.5">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5 text-gray-500">
                <rect x="3" y="4" width="14" height="13" rx="2" />
                <path d="M7 2v3M13 2v3M3 9h14" />
              </svg>
              <span className="text-xs text-gray-400">▾</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <Link
                href="/faturas-compra/nova"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                title="Nova Fatura de Compra"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                  <line x1="10" y1="5" x2="10" y2="15" />
                  <line x1="5" y1="10" x2="15" y2="10" />
                </svg>
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                title="Actualizar"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
                  <path d="M4 12a8 8 0 0 1 13.66-4.24M16 4v4h-4" />
                  <path d="M16 8a8 8 0 0 1-13.66 4.24M4 16v-4h4" />
                </svg>
              </button>
              <button className="flex h-7 items-center gap-1 rounded-full border border-gray-300 bg-white px-2.5 text-xs text-gray-600 hover:bg-gray-50">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
                  <circle cx="10" cy="7" r="4" />
                  <path d="M2 17c0-3.3 2.7-6 6-6h4c3.3 0 6 2.7 6 6" />
                </svg>
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12 text-sm text-gray-400">A carregar…</div>
          )}
          {isError && (
            <div className="flex items-center justify-center py-12 text-sm text-red-500">
              Erro: {(error as Error)?.message ?? "Falha ao carregar dados"}
            </div>
          )}
          {!isLoading && !isError && <FaturasTable faturas={data?.content ?? []} />}

          {data && data.totalElements > 0 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-5 py-2.5 text-xs text-gray-500">
              <span>Pág. {data.number + 1} de {Math.max(data.totalPages, 1)}</span>
              <div className="flex gap-1">
                <button
                  disabled={data.first}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded border border-gray-300 px-2.5 py-1 hover:bg-gray-50 disabled:opacity-40"
                >
                  Anterior
                </button>
                <button
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
    </div>
  );
}
