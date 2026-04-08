import { apiRequest } from "./client";
import type { DashboardStats } from "@/app/(myapp)/types/efatura";

export const dashboardApi = {
  stats: () => apiRequest<DashboardStats>("/dashboard/stats"),
};
