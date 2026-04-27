import type { DashboardStats, TopProduto } from "@/app/(myapp)/types/efatura";
import { apiRequest } from "./client";

export interface VendasMensaisData {
  mes: string;
  vendas: number;
  compras: number;
}

export interface EstadoCount {
  estado: string;
  count: number;
}

export const dashboardApi = {
  stats: () => apiRequest<DashboardStats>("/dashboard/stats"),

  vendasMensais: (ano?: number) =>
    apiRequest<VendasMensaisData[]>(`/reports/vendas/mensais${ano ? `?ano=${ano}` : ""}`),

  topProdutos: (limit = 5) =>
    apiRequest<TopProduto[]>(`/reports/vendas/top-produtos?limit=${limit}`),

  porEstado: () =>
    apiRequest<EstadoCount[]>("/reports/vendas/por-estado"),
};
