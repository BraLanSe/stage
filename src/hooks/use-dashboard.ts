"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";

export const DASHBOARD_KEY = "dashboard" as const;

export function useDashboardStats() {
  return useQuery({
    queryKey: [DASHBOARD_KEY, "stats"],
    queryFn: () => dashboardApi.stats(),
    staleTime: 1000 * 60 * 5, // 5 min
  });
}
