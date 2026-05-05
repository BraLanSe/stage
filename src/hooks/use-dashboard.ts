"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";

export const DASHBOARD_KEY = "dashboard" as const;

export function useDashboardStats() {
  return useQuery({
    queryKey: [DASHBOARD_KEY, "stats"],
    queryFn: () => dashboardApi.stats(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useVendasMensais(ano?: number) {
  return useQuery({
    queryKey: [DASHBOARD_KEY, "mensais", ano],
    queryFn: () => dashboardApi.vendasMensais(ano),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTopProdutos(limit = 5) {
  return useQuery({
    queryKey: [DASHBOARD_KEY, "top-produtos", limit],
    queryFn: () => dashboardApi.topProdutos(limit),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePorEstado() {
  return useQuery({
    queryKey: [DASHBOARD_KEY, "por-estado"],
    queryFn: () => dashboardApi.porEstado(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTopClientes(limit = 5) {
  return useQuery({
    queryKey: [DASHBOARD_KEY, "top-clientes", limit],
    queryFn: () => dashboardApi.topClientes(limit),
    staleTime: 1000 * 60 * 5,
  });
}
