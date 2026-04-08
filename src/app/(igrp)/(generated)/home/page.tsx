"use client";

import { useDashboardStats } from "@/hooks/use-dashboard";
import type { DashboardStats } from "@/app/(myapp)/types/efatura";

// ── Formatters ───────────────────────────────────────────────

function formatECV(value = 0) {
  return new Intl.NumberFormat("pt-CV", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value) + " ECV";
}

function formatPct(value = 0) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(0)}%`;
}

// ── Donut Chart ──────────────────────────────────────────────

function DonutChart({ data }: { data: DashboardStats["vendasPorMeio"] }) {
  const total = data.reduce((s, d) => s + d.valor, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center">
        <svg viewBox="0 0 160 160" className="w-40 h-40">
          <circle cx="80" cy="80" r="55" fill="none" stroke="#e5e7eb" strokeWidth="28" />
        </svg>
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
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: seg.cor }}
            />
            <span className="text-gray-600">{seg.meio}</span>
            <span className="font-medium">{(seg.pct * 100).toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Line Chart ───────────────────────────────────────────────

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
        {/* Y grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = PAD.top + innerH * (1 - t);
          return (
            <g key={t}>
              <line
                x1={PAD.left} y1={y}
                x2={PAD.left + innerW} y2={y}
                stroke="#e5e7eb" strokeDasharray="3 3"
              />
              <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
                {t === 0 ? "0" : `${(maxVal * t / 1000).toFixed(0)}k`}
              </text>
            </g>
          );
        })}

        {/* X labels */}
        {months.map((m, i) => (
          <text
            key={i}
            x={PAD.left + i * xStep}
            y={H - 6}
            textAnchor="middle"
            fontSize="9"
            fill="#9ca3af"
          >
            {m}
          </text>
        ))}

        {/* Lines */}
        <path d={toPath("vendas")} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" />
        <path d={toPath("compras")} fill="none" stroke="#1e3a5f" strokeWidth="2" strokeLinejoin="round" strokeDasharray="4 2" />

        {/* Dots */}
        {data.map((d, i) => {
          const x = PAD.left + i * xStep;
          const yV = PAD.top + innerH - (d.vendas / maxVal) * innerH;
          const yC = PAD.top + innerH - (d.compras / maxVal) * innerH;
          return (
            <g key={i}>
              <circle cx={x} cy={yV} r="3" fill="#3b82f6" />
              <circle cx={x} cy={yC} r="3" fill="#1e3a5f" />
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-2 flex items-center justify-center gap-6 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-5 rounded bg-blue-500 inline-block" />
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

// ── KPI Card ─────────────────────────────────────────────────

function KpiCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-5 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────

function StatCard({
  label,
  value,
  variation,
}: {
  label: string;
  value: number;
  variation: number;
}) {
  const isPositive = variation >= 0;
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <span
        className={`text-xs font-medium ${isPositive ? "text-green-600" : "text-red-500"}`}
      >
        {formatPct(variation)}
      </span>
      <p className="mt-1 text-2xl font-bold text-gray-800">{formatECV(value)}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
        {label}
      </p>
    </div>
  );
}

// ── Icons (inline SVG) ────────────────────────────────────────

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

// ── Mock fallback (used when API is unavailable) ───────────────

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

// ── Page ─────────────────────────────────────────────────────

export default function PageHomeComponent() {
  const { data, isLoading } = useDashboardStats();
  const stats = data ?? MOCK_STATS;

  return (
    <div className="flex flex-col gap-5 p-6">
      {isLoading && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="h-full w-1/3 animate-[slide_1.5s_ease-in-out_infinite] bg-blue-400 rounded-full" />
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard icon={<IconPeople />} label="Clientes" value={stats.totalClientes} />
        <KpiCard icon={<IconTruck />} label="Fornecedores" value={stats.totalFornecedores} />
        <KpiCard icon={<IconList />} label="Produtos" value={stats.totalProdutos} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              Vendas por meios de pagamentos
            </h2>
            <button className="text-gray-400 hover:text-gray-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex min-h-[180px] items-center justify-center">
            <DonutChart data={stats.vendasPorMeio} />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              Compra/Venda mensalmente
            </h2>
            <button className="text-gray-400 hover:text-gray-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
          <LineChart data={stats.vendasMensais} />
        </div>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Vendas"
          value={stats.totalVendas}
          variation={stats.variacaoVendas}
        />
        <StatCard
          label="Despesas"
          value={stats.totalDespesas}
          variation={stats.variacaoDespesas}
        />
        <StatCard
          label="Ganho/Lucro"
          value={stats.ganhoLucro}
          variation={stats.variacaoLucro}
        />
      </div>
    </div>
  );
}
