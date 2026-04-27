/* IGRP-GENERATED-PAGE */
"use client";

import {
  IGRPBadge,
  IGRPButton,
  IGRPContainer,
  IGRPInputText,
  IGRPSelect,
} from "@igrp/igrp-framework-react-design-system";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { EstadoFatura, FaturaVenda } from "@/app/(myapp)/types/efatura";
import { useClientes } from "@/hooks/use-cadastro";
import { useFaturasVenda } from "@/hooks/use-faturas-venda";

// ── Helpers ────────────────────────────────────────────────────

function formatCVE(value?: number) {
  if (value === undefined || value === null) return "—";
  return new Intl.NumberFormat("pt-CV", {
    style: "currency",
    currency: "CVE",
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

// ── Badges ──────────────────────────────────────────────────────

function EstadoBadge({ estado }: { estado?: EstadoFatura }) {
  if (!estado) return null;
  return (
    <IGRPBadge color={estado === "CONFIRMADO" ? "success" : "secondary"}>
      {estado === "CONFIRMADO" ? "Confirmado" : "Rascunho"}
    </IGRPBadge>
  );
}

// ── Summary Row ─────────────────────────────────────────────────

function SummaryStrip({ faturas }: { faturas: FaturaVenda[] }) {
  const total = faturas.reduce((s, f) => s + (f.total ?? f.valorFatura ?? 0), 0);
  const confirmadas = faturas.filter((f) => f.estado === "CONFIRMADO").length;
  const rascunhos = faturas.filter((f) => f.estado !== "CONFIRMADO").length;

  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      {[
        { label: "Total filtrado", value: formatCVE(total), accent: true },
        { label: "Confirmadas", value: confirmadas.toString(), accent: false },
        { label: "Rascunhos", value: rascunhos.toString(), accent: false },
      ].map(({ label, value, accent }) => (
        <div
          key={label}
          className={`rounded-xl border px-4 py-3 text-center ${
            accent
              ? "border-[#3579f6] bg-[#3579f6]/5"
              : "border-slate-100 bg-white shadow-sm"
          }`}
        >
          <p className={`text-xs uppercase tracking-wide font-medium mb-0.5 ${accent ? "text-[#3579f6]" : "text-gray-400"}`}>
            {label}
          </p>
          <p className={`text-lg font-bold ${accent ? "text-[#3579f6]" : "text-gray-800"}`}>
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}

// ── Table ────────────────────────────────────────────────────────

function ReportTable({ faturas }: { faturas: FaturaVenda[] }) {
  if (faturas.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12 text-gray-300" aria-hidden="true">
          <rect x="8" y="4" width="32" height="40" rx="3" />
          <path d="M16 16h16M16 22h16M16 28h10" />
        </svg>
        <p className="text-sm font-medium text-gray-700">Nenhuma fatura corresponde aos filtros</p>
        <p className="text-xs text-gray-400">Ajuste a plage de datas ou o cliente selecionado.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nº Documento</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Data Emissão</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Data Vencimento</th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Valor</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide" />
          </tr>
        </thead>
        <tbody>
          {faturas.map((f) => (
            <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="px-3 py-2.5">
                <Link href={`/faturas-venda/${f.id}`} className="font-medium text-blue-600 hover:underline">
                  {f.numero ?? f.codigo ?? `#${f.id}`}
                </Link>
              </td>
              <td className="px-3 py-2.5 text-gray-700">{f.clienteNome ?? `Cliente ${f.clienteId}`}</td>
              <td className="px-3 py-2.5 text-gray-600">{formatDate(f.dataEmissao)}</td>
              <td className="px-3 py-2.5 text-gray-600">{formatDate(f.dataVencimento)}</td>
              <td className="px-3 py-2.5 text-right font-semibold text-gray-800">
                {formatCVE(f.total ?? f.valorFatura)}
              </td>
              <td className="px-3 py-2.5 text-center">
                <EstadoBadge estado={f.estado} />
              </td>
              <td className="px-3 py-2.5 text-center">
                <Link
                  href={`/faturas-venda/${f.id}`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-gray-200 bg-gray-50">
            <td colSpan={4} className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {faturas.length} fatura{faturas.length !== 1 ? "s" : ""}
            </td>
            <td className="px-3 py-2.5 text-right text-sm font-bold text-gray-800">
              {formatCVE(faturas.reduce((s, f) => s + (f.total ?? f.valorFatura ?? 0), 0))}
            </td>
            <td colSpan={2} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────

export default function ReportsVendasPage() {
  const { data: clientesPage } = useClientes(0, 200);
  const clientes = clientesPage?.content ?? [];

  // Fetch all pages until done (up to 500 rows for reporting)
  const { data: page1 } = useFaturasVenda(0, 100);
  const { data: page2 } = useFaturasVenda(1, 100);
  const { data: page3 } = useFaturasVenda(2, 100);
  const { data: page4 } = useFaturasVenda(3, 100);
  const { data: page5 } = useFaturasVenda(4, 100);

  const allFaturas = useMemo(() => [
    ...(page1?.content ?? []),
    ...(page2?.content ?? []),
    ...(page3?.content ?? []),
    ...(page4?.content ?? []),
    ...(page5?.content ?? []),
  ], [page1, page2, page3, page4, page5]);

  // ── Filter state ──────────────────────────────────────────────
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [clienteId, setClienteId] = useState<string>("");
  const [estado, setEstado] = useState<string>("");

  const filtered = useMemo(() => {
    return allFaturas.filter((f) => {
      const emissao = f.dataEmissao ?? "";
      if (dataInicio && emissao < dataInicio) return false;
      if (dataFim   && emissao > dataFim)   return false;
      if (clienteId && String(f.clienteId) !== clienteId) return false;
      if (estado    && f.estado !== estado) return false;
      return true;
    });
  }, [allFaturas, dataInicio, dataFim, clienteId, estado]);

  function handleReset() {
    setDataInicio("");
    setDataFim("");
    setClienteId("");
    setEstado("");
  }

  const isFiltering = !!(dataInicio || dataFim || clienteId || estado);

  return (
    <IGRPContainer
      id="reports-vendas"
      name="reports-vendas"
      tag="reports-vendas"
      className="flex flex-col gap-0 p-0"
    >
      <IGRPButton name="force-studio" tag="force-studio" id="force-studio" className="sr-only">FORCE</IGRPButton>

      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white px-6 py-2.5">
        <nav className="flex items-center gap-1 text-xs text-gray-500">
          <Link href="/" className="hover:text-gray-700">Página Inicial</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">Relatório de Vendas</span>
        </nav>
      </div>

      <div className="p-5">
        {/* Filters card */}
        <div className="mb-4 rounded-xl border border-slate-100 bg-white shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 border-l-[3px] border-[#3579f6] pl-2">
              Filtros
            </h2>
            {isFiltering && (
              <IGRPButton
                name="btn-reset"
                tag="btn-reset"
                variant="ghost"
                size="sm"
                onClick={handleReset}
              >
                Limpar filtros
              </IGRPButton>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <IGRPInputText
              id="input-data-inicio"
              name="dataInicio"
              tag="input-data-inicio"
              label="De (data emissão)"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
            <IGRPInputText
              id="input-data-fim"
              name="dataFim"
              tag="input-data-fim"
              label="Até (data emissão)"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
            <IGRPSelect
              name="clienteId"
              tag="select-cliente"
              label="Cliente"
              placeholder="Todos os clientes"
              options={clientes.map((c) => ({ label: c.desig, value: String(c.id) }))}
              value={clienteId || undefined}
              onValueChange={(v) => setClienteId(v)}
            />
            <IGRPSelect
              name="estado"
              tag="select-estado"
              label="Estado"
              placeholder="Todos os estados"
              options={[
                { label: "Rascunho", value: "RASCUNHO" },
                { label: "Confirmado", value: "CONFIRMADO" },
              ]}
              value={estado || undefined}
              onValueChange={(v) => setEstado(v)}
            />
          </div>
        </div>

        {/* Summary strip */}
        <SummaryStrip faturas={filtered} />

        {/* Results table */}
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 text-blue-500" aria-hidden="true">
                <line x1="4" y1="5" x2="16" y2="5" />
                <line x1="4" y1="10" x2="16" y2="10" />
                <line x1="4" y1="15" x2="16" y2="15" />
              </svg>
              <h1 className="text-sm font-semibold text-gray-800">Relatório de Faturas de Venda</h1>
            </div>
            <span className="text-xs text-gray-400">
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
              {isFiltering ? " (filtrado)" : ""}
            </span>
          </div>
          <ReportTable faturas={filtered} />
        </div>
      </div>
    </IGRPContainer>
  );
}
