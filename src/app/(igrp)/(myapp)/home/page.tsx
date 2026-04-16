/* IGRP-GENERATED-PAGE */
"use client";

/* IGRP-CUSTOM-CODE-BEGIN(imports) */
import {
  IGRPButton,
  IGRPCard,
  IGRPCardContent,
  IGRPContainer,
  IGRPPageHeader,
} from "@igrp/igrp-framework-react-design-system";
import { useRouter } from "next/navigation";
import { useDashboardStats } from "@/hooks/use-dashboard";
import type { DashboardStats } from "@/app/(myapp)/types/efatura";
/* IGRP-CUSTOM-CODE-END */

/* IGRP-CUSTOM-CODE-BEGIN(helpers) */
function formatECV(value = 0) {
  return (
    new Intl.NumberFormat("pt-CV", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + " ECV"
  );
}

function formatPct(value = 0) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(0)}%`;
}
/* IGRP-CUSTOM-CODE-END */

/* IGRP-CUSTOM-CODE-BEGIN(charts) */
function DonutChart({ data }: { data: DashboardStats["vendasPorMeio"] }) {
  const total = data.reduce((s, d) => s + d.valor, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center">
        <svg viewBox="0 0 160 160" className="w-40 h-40">
          <circle cx="80" cy="80" r="55" fill="none" stroke="#e5e7eb" strokeWidth="28" />
        </svg>
        <p className="ml-4 text-xs text-gray-400">Sem dados</p>
      </div>
    );
  }

  let offset = 0;
  const circumference = 2 * Math.PI * 55;
  const segments = data.map((d) => {
    const pct = d.valor / total;
    const seg = { ...d, offset, pct, dash: pct * circumference };
    offset += pct * circumference;
    return seg;
  });

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 160 160" className="w-40 h-40 -rotate-90">
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx="80"
            cy="80"
            r="55"
            fill="none"
            stroke={seg.cor}
            strokeWidth="28"
            strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
            strokeDashoffset={-seg.offset}
          />
        ))}
      </svg>
      <ul className="space-y-1.5 text-xs">
        {segments.map((seg, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seg.cor }} />
            <span className="text-gray-600">{seg.meio}</span>
            <span className="font-medium">{(seg.pct * 100).toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LineChart({ data }: { data: DashboardStats["vendasMensais"] }) {
  const W = 520;
  const H = 180;
  const PAD = { top: 20, right: 16, bottom: 36, left: 48 };
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
  const months = data.length === 12 ? MONTHS : data.map((d) => d.mes);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 280 }}>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = PAD.top + innerH * (1 - t);
          return (
            <g key={t}>
              <line x1={PAD.left} y1={y} x2={PAD.left + innerW} y2={y} stroke="#e5e7eb" strokeDasharray="3 3" />
              <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
                {t === 0 ? "0" : `${(maxVal * t / 1000).toFixed(0)}k`}
              </text>
            </g>
          );
        })}
        {months.map((m, i) => (
          <text key={i} x={PAD.left + i * xStep} y={H - 6} textAnchor="middle" fontSize="9" fill="#9ca3af">
            {m}
          </text>
        ))}
        <path d={toPath("vendas")} fill="none" stroke="#3579f6" strokeWidth="2" strokeLinejoin="round" />
        <path d={toPath("compras")} fill="none" stroke="#1e3a5f" strokeWidth="2" strokeLinejoin="round" strokeDasharray="4 2" />
        {data.map((d, i) => {
          const x = PAD.left + i * xStep;
          const yV = PAD.top + innerH - (d.vendas / maxVal) * innerH;
          const yC = PAD.top + innerH - (d.compras / maxVal) * innerH;
          return (
            <g key={i}>
              <circle cx={x} cy={yV} r="3" fill="#3579f6" />
              <circle cx={x} cy={yC} r="3" fill="#1e3a5f" />
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex items-center justify-center gap-6 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-5 rounded bg-[#3579f6] inline-block" />
          Vendas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-5 rounded bg-[#1e3a5f] inline-block" />
          Compras
        </span>
      </div>
    </div>
  );
}
/* IGRP-CUSTOM-CODE-END */

/* IGRP-CUSTOM-CODE-BEGIN(icons) */
const IconPeople = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconTruck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
    <rect x="1" y="3" width="15" height="13" rx="1" />
    <path d="M16 8h4l3 5v3h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const IconList = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);
/* IGRP-CUSTOM-CODE-END */

/* IGRP-CUSTOM-CODE-BEGIN(mock) */
const MOCK_STATS: DashboardStats = {
  totalClientes: 4,
  totalFornecedores: 0,
  totalProdutos: 9,
  totalVendas: 850304,
  totalDespesas: 0,
  ganhoLucro: 850304,
  variacaoVendas: 0,
  variacaoDespesas: 0,
  variacaoLucro: 0,
  vendasMensais: ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"].map((mes) => ({
    mes,
    vendas: 0,
    compras: 0,
  })),
  vendasPorMeio: [],
};
/* IGRP-CUSTOM-CODE-END */

export default function PageHomeComponent() {
  /* IGRP-CUSTOM-CODE-BEGIN(onLoad) */
  const router = useRouter();
  const { data, isLoading } = useDashboardStats();
  const stats = data ?? MOCK_STATS;
  /* IGRP-CUSTOM-CODE-END */

  return (
    <IGRPContainer
      id="home"
      name="home"
      tag="home"
      className="flex flex-col gap-5 p-6 bg-[#f7f9fc] min-h-screen"
    >
      <IGRPButton name="force-studio" tag="force-studio" id="force-studio">FORCE</IGRPButton>
      <IGRPButton name="trigger-btn" tag="trigger-btn" variant="ghost" size="sm" className="sr-only">refresh</IGRPButton>
      <IGRPPageHeader
        name="home-header"
        tag="home-header"
        title="Dashboard"
        description="Visão geral da actividade de facturação"
      />

      {/* IGRP-CUSTOM-CODE-BEGIN(loading-bar) */}
      {isLoading && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="h-full w-1/3 animate-[slide_1.5s_ease-in-out_infinite] bg-[#3579f6] rounded-full" />
        </div>
      )}
      {/* IGRP-CUSTOM-CODE-END */}

      {/* Summary Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <IGRPCard
          name="card-total-vendas"
          tag="card-total-vendas"
          className="rounded-2xl border border-[#3579f6] bg-[#3579f6]/5"
        >
          <IGRPCardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#3579f6] flex items-center justify-center flex-shrink-0 text-white">
              <IconChart />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#3579f6] uppercase tracking-wide mb-0.5">Total Vendas</p>
              <p className="text-xl font-bold text-gray-800 truncate">{formatECV(stats.totalVendas)}</p>
              <p className={`text-xs font-medium mt-0.5 ${stats.variacaoVendas >= 0 ? "text-green-600" : "text-red-500"}`}>
                {formatPct(stats.variacaoVendas)} vs mês anterior
              </p>
            </div>
          </IGRPCardContent>
        </IGRPCard>

        <IGRPCard
          name="card-pendentes"
          tag="card-pendentes"
          className="rounded-2xl shadow-[0_2px_12px_rgba(53,121,246,0.07)] border border-slate-100"
        >
          <IGRPCardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" className="h-7 w-7">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Pendentes</p>
              <p className="text-3xl font-bold text-gray-800">0</p>
              <p className="text-xs text-muted-foreground mt-0.5">Faturas em rascunho</p>
            </div>
          </IGRPCardContent>
        </IGRPCard>

        <IGRPCard
          name="card-clientes-strip"
          tag="card-clientes-strip"
          className="rounded-2xl shadow-[0_2px_12px_rgba(53,121,246,0.07)] border border-slate-100"
        >
          <IGRPCardContent className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#3579f6]/10 flex items-center justify-center flex-shrink-0 text-[#3579f6]">
                <IconPeople />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Clientes</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalClientes}</p>
              </div>
            </div>
            <IGRPButton
              name="btn-ver-clientes"
              tag="btn-ver-clientes"
              variant="outline"
              size="sm"
              onClick={() => router.push("/cadastro")}
            >
              Ver
            </IGRPButton>
          </IGRPCardContent>
        </IGRPCard>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <IGRPCard
          name="card-kpi-clientes"
          tag="card-kpi-clientes"
          className="rounded-2xl shadow-[0_2px_12px_rgba(53,121,246,0.07)] border border-slate-100"
        >
          <IGRPCardContent className="p-5 flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#3579f6]/10 text-[#3579f6]">
              <IconPeople />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clientes</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalClientes}</p>
            </div>
          </IGRPCardContent>
        </IGRPCard>

        <IGRPCard
          name="card-kpi-fornecedores"
          tag="card-kpi-fornecedores"
          className="rounded-2xl shadow-[0_2px_12px_rgba(53,121,246,0.07)] border border-slate-100"
        >
          <IGRPCardContent className="p-5 flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#3579f6]/10 text-[#3579f6]">
              <IconTruck />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fornecedores</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalFornecedores}</p>
            </div>
          </IGRPCardContent>
        </IGRPCard>

        <IGRPCard
          name="card-kpi-produtos"
          tag="card-kpi-produtos"
          className="rounded-2xl shadow-[0_2px_12px_rgba(53,121,246,0.07)] border border-slate-100"
        >
          <IGRPCardContent className="p-5 flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#3579f6]/10 text-[#3579f6]">
              <IconList />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Produtos</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalProdutos}</p>
            </div>
          </IGRPCardContent>
        </IGRPCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <IGRPCard
          name="card-chart-meios"
          tag="card-chart-meios"
          className="rounded-2xl shadow-[0_2px_12px_rgba(53,121,246,0.07)] border border-slate-100"
        >
          <IGRPCardContent className="p-5">
            <h2 className="mb-4 text-sm font-semibold text-gray-700 border-l-[3px] border-[#3579f6] pl-2">
              Vendas por meios de pagamento
            </h2>
            <div className="flex min-h-[180px] items-center justify-center">
              <DonutChart data={stats.vendasPorMeio} />
            </div>
          </IGRPCardContent>
        </IGRPCard>

        <IGRPCard
          name="card-chart-mensal"
          tag="card-chart-mensal"
          className="rounded-2xl shadow-[0_2px_12px_rgba(53,121,246,0.07)] border border-slate-100"
        >
          <IGRPCardContent className="p-5">
            <h2 className="mb-4 text-sm font-semibold text-gray-700 border-l-[3px] border-[#3579f6] pl-2">
              Compra / Venda mensalmente
            </h2>
            <LineChart data={stats.vendasMensais} />
          </IGRPCardContent>
        </IGRPCard>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <IGRPCard
          name="card-stat-vendas"
          tag="card-stat-vendas"
          className="rounded-2xl shadow-[0_2px_12px_rgba(53,121,246,0.07)] border border-slate-100"
        >
          <IGRPCardContent className="p-6 flex flex-col items-center justify-center text-center">
            <span className={`text-xs font-medium ${stats.variacaoVendas >= 0 ? "text-green-600" : "text-red-500"}`}>
              {formatPct(stats.variacaoVendas)}
            </span>
            <p className="mt-1 text-2xl font-bold text-gray-800">{formatECV(stats.totalVendas)}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-gray-400">Vendas</p>
          </IGRPCardContent>
        </IGRPCard>

        <IGRPCard
          name="card-stat-despesas"
          tag="card-stat-despesas"
          className="rounded-2xl shadow-[0_2px_12px_rgba(53,121,246,0.07)] border border-slate-100"
        >
          <IGRPCardContent className="p-6 flex flex-col items-center justify-center text-center">
            <span className={`text-xs font-medium ${stats.variacaoDespesas >= 0 ? "text-green-600" : "text-red-500"}`}>
              {formatPct(stats.variacaoDespesas)}
            </span>
            <p className="mt-1 text-2xl font-bold text-gray-800">{formatECV(stats.totalDespesas)}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-gray-400">Despesas</p>
          </IGRPCardContent>
        </IGRPCard>

        <IGRPCard
          name="card-stat-lucro"
          tag="card-stat-lucro"
          className="rounded-2xl border border-[#3579f6] bg-[#3579f6]/5"
        >
          <IGRPCardContent className="p-6 flex flex-col items-center justify-center text-center">
            <span className={`text-xs font-medium ${stats.variacaoLucro >= 0 ? "text-green-600" : "text-red-500"}`}>
              {formatPct(stats.variacaoLucro)}
            </span>
            <p className="mt-1 text-2xl font-bold text-[#3579f6]">{formatECV(stats.ganhoLucro)}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-[#3579f6]">Ganho / Lucro</p>
          </IGRPCardContent>
        </IGRPCard>
      </div>
    </IGRPContainer>
  );
}
