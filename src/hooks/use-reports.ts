"use client";

import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api/reports";

export const REPORTS_KEY = "reports" as const;

export function useMonthlyTotals(year?: number) {
  return useQuery({
    queryKey: [REPORTS_KEY, "monthly-totals", year],
    queryFn: () => reportsApi.monthlyTotals(year),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTopProdutos() {
  return useQuery({
    queryKey: [REPORTS_KEY, "top-produtos"],
    queryFn: reportsApi.topProdutos,
    staleTime: 1000 * 60 * 5,
  });
}

export function useEstadoDistribuicao() {
  return useQuery({
    queryKey: [REPORTS_KEY, "estado-distribuicao"],
    queryFn: reportsApi.estadoDistribuicao,
    staleTime: 1000 * 60 * 5,
  });
}
