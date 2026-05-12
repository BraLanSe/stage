import type { EstadoDistribuicao, MonthlyTotal, TopProduto } from "@/app/(myapp)/types/efatura";
import { apiRequest } from "./client";

export const reportsApi = {
  monthlyTotals: (year?: number) =>
    apiRequest<MonthlyTotal[]>(`/reports/monthly-totals${year ? `?year=${year}` : ""}`),
  topProdutos: () =>
    apiRequest<TopProduto[]>("/reports/top-produtos"),
  estadoDistribuicao: () =>
    apiRequest<EstadoDistribuicao[]>("/reports/estado-distribuicao"),
};
