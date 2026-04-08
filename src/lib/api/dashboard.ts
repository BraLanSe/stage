import type { DashboardStats } from "@/app/(myapp)/types/efatura";
import { apiRequest } from "./client";

export const dashboardApi = {
  stats: () => apiRequest<DashboardStats>("/dashboard/stats"),
};
