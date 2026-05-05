/* IGRP-GENERATED-PAGE */
"use client";

import {
  IGRPButton,
  IGRPCard,
  IGRPCardContent,
  IGRPContainer,
  IGRPPageHeader,
} from "@igrp/igrp-framework-react-design-system";
import { useRouter } from "next/navigation";
import { useDashboardStats, useTopClientes } from "@/hooks/use-dashboard";
import type { DashboardStats, TopCliente } from "@/app/(myapp)/types/efatura";

// ── Helpers ───────────────────────────────────────────────────

function formatCVE(value?: number) {
  if (value === undefined || value === null) return "—";
  return new Intl.NumberFormat("pt-CV", {
    style: "currency",
    currency: "CVE",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// ── Vendas vs Compras Line Chart ──────────────────────────────

function VendasComprasChart({ data }: { data: DashboardStats["vendasMensais"] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex min-h-[220px] items-center justify-center">
        <p className="text-xs text-gray-400">Dados indisponíveis</p>
      </div>
    );
  }

  const W = 540;
  const H = 200;
  const PAD = { top: 24, right: 20, bottom: 38, left: 60 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const allValues = data.flatMap((d) => [d.vendas, d.compras]);
  const maxVal = Math.max(...allValues, 1);
  const xStep = innerW / Math.max(data.length - 1, 1);

  function toPath(key: "vendas" | "compras") {
    return data
      .map((d, i) => {
        const x = PAD.left + i * xStep;
        const y = PAD.top + innerH - (d[key] / maxVal) * innerH;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }

  const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const labels = data.length === 12 ? MONTHS : data.map((d) => d.mes);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 300 }}>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = PAD.top + innerH * (1 - t);
          return (
            <g key={t}>
              <line x1={PAD.left} y1={y} x2={PAD.left + innerW} y2={y}
                    stroke="#e5e7eb" strokeDasharray="3 3" />
              <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
                {t === 0 ? "0" : `${((maxVal * t) / 1000).toFixed(0)}k`}
              </text>
            </g>
          );
        })}
        {labels.map((m, i) => (
          <text key={i} x={PAD.left + i * xStep} y={H - 8}
                textAnchor="middle" fontSize="9" fill="#9ca3af">
            {m}
          </text>
        ))}
        <path d={toPath("vendas")} fill="none" stroke="#3579f6" strokeWidth="2.5" strokeLinejoin="round" />
        <path d={toPath("compras")} fill="none" stroke="#1e3a5f" strokeWidth="2.5" strokeLinejoin="round" strokeDasharray="5 3" />
        {data.map((d, i) => {
          const x = PAD.left + i * xStep;
          const yV = PAD.top + innerH - (d.vendas / maxVal) * innerH;
          const yC = PAD.top + innerH - (d.compras / maxVal) * innerH;
          return (
            <g key={i}>
              <circle cx={x} cy={yV} r="3.5" fill="#3579f6" />
              <circle cx={x} cy={yC} r="3.5" fill="#1e3a5f" />
            </g>
          );
        })}
      </svg>
      <div className="mt-3 flex items-center justify-center gap-8 text-xs text-gray-500">
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-6 rounded bg-[#3579f6] inline-block" />
          Vendas
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-6 rounded bg-[#1e3a5f] inline-block" />
          Compras
        </span>
      </div>
    </div>
  );
}

// ── Top 5 Clients Bar Chart ────────────────────────────────────

function TopClientesChart({ clientes }: { clientes?: TopCliente[] }) {
  if (!clientes || clientes.length === 0) {
    return (
      <p className="py-8 text-center text-xs text-gray-400">
        Sem faturas confirmadas ainda
      </p>
    );
  }
  const max = clientes[0]?.totalFaturado ?? 1;
  const COLORS = ["#3579f6", "#2563eb", "#1d4ed8", "#1e3a8a", "#172554"];

  return (
    <ul className="space-y-4">
      {clientes.map((c, i) => (
        <li key={i}>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white text-[10px] font-bold"
                style={{ backgroundColor: COLORS[i] ?? "#6b7280" }}
              >
                {i + 1}
              </span>
              <span className="font-medium text-gray-700 truncate max-w-[180px]">
                {c.desig}
              </span>
              {c.nif && (
                <span className="text-gray-400 hidden sm:inline">({c.nif})</span>
              )}
            </div>
            <span className="text-gray-600 tabular-nums font-semibold shrink-0 ml-2">
              {formatCVE(c.totalFaturado)}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.round((c.totalFaturado / max) * 100)}%`,
                backgroundColor: COLORS[i] ?? "#6b7280",
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

// ── Summary KPI ────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <IGRPCard
      name={`kpi-${label}`}
      tag={`kpi-${label}`}
      className="rounded-2xl border border-slate-100 shadow-sm"
    >
      <IGRPCardContent className="p-4 flex items-center gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: color + "18", color }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            {label}
          </p>
          <p className="text-lg font-bold text-gray-800 truncate">{value}</p>
        </div>
      </IGRPCardContent>
    </IGRPCard>
  );
}

// ── Mock data ──────────────────────────────────────────────────

const EMPTY_STATS = {
  vendasMensais: ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"].map(
    (mes) => ({ mes, vendas: 0, compras: 0 })
  ),
  totalVendas: 0,
  totalDespesas: 0,
  ganhoLucro: 0,
} as const;

// ── Page ──────────────────────────────────────────────────────

export default function DashboardAnalyticsPage() {
  const router = useRouter();
  const { data: stats, isLoading } = useDashboardStats();
  const { data: topClientesData } = useTopClientes(5);

  const vendasMensais = stats?.vendasMensais ?? EMPTY_STATS.vendasMensais;
  const totalVendas   = stats?.totalVendas   ?? 0;
  const totalDespesas = stats?.totalDespesas ?? 0;
  const ganhoLucro    = stats?.ganhoLucro    ?? 0;
  const topClientes   = topClientesData ?? stats?.topClientes ?? [];

  return (
    <IGRPContainer
      id="dashboard-analytics"
      name="dashboard-analytics"
      tag="dashboard-analytics"
      className="flex flex-col gap-5 p-6 bg-[#f7f9fc] min-h-screen"
    >
      <IGRPButton name="force-studio" tag="force-studio" id="force-studio" className="sr-only">
        FORCE
      </IGRPButton>

      <IGRPPageHeader
        name="dashboard-header"
        tag="dashboard-header"
        title="Analytics"
        description={`Análise detalhada de facturação — ${new Date().getFullYear()}`}
      />

      {isLoading && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="h-full w-1/3 animate-pulse bg-[#3579f6] rounded-full" />
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Total Vendas"
          value={formatCVE(totalVendas)}
          color="#3579f6"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          }
        />
        <KpiCard
          label="Total Despesas"
          value={formatCVE(totalDespesas)}
          color="#1e3a5f"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
              <polyline points="17 18 23 18 23 12" />
            </svg>
          }
        />
        <KpiCard
          label="Ganho / Lucro"
          value={formatCVE(ganhoLucro)}
          color={ganhoLucro >= 0 ? "#10b981" : "#ef4444"}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          }
        />
      </div>

      {/* Volume Vendas vs Compras */}
      <IGRPCard
        name="card-volume-mensal"
        tag="card-volume-mensal"
        className="rounded-2xl border border-slate-100 shadow-sm"
      >
        <IGRPCardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 border-l-[3px] border-[#3579f6] pl-2">
              Volume Vendas vs Compras — {new Date().getFullYear()}
            </h2>
            <IGRPButton
              name="btn-relatorio"
              tag="btn-relatorio"
              variant="outline"
              size="sm"
              onClick={() => router.push("/reports/vendas")}
            >
              Ver relatório
            </IGRPButton>
          </div>
          <VendasComprasChart data={vendasMensais} />
        </IGRPCardContent>
      </IGRPCard>

      {/* Top 5 Clientes */}
      <IGRPCard
        name="card-top-clientes"
        tag="card-top-clientes"
        className="rounded-2xl border border-slate-100 shadow-sm"
      >
        <IGRPCardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 border-l-[3px] border-[#3579f6] pl-2">
              Top 5 Clientes por Chiffre d&apos;Affaires
            </h2>
            <IGRPButton
              name="btn-ver-clientes"
              tag="btn-ver-clientes"
              variant="ghost"
              size="sm"
              onClick={() => router.push("/cadastro")}
            >
              Cadastro
            </IGRPButton>
          </div>
          <TopClientesChart clientes={topClientes} />
        </IGRPCardContent>
      </IGRPCard>
    </IGRPContainer>
  );
}
