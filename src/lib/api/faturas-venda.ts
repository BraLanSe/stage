import { apiRequest } from "./client";
import type {
  CriarFaturaVendaRequest,
  FaturaVenda,
  PaginatedResponse,
} from "@/app/(myapp)/types/efatura";

const BASE = "/faturas-venda";

export const faturasVendaApi = {
  listar: (page = 0, size = 10, params?: Record<string, string>) => {
    const search = new URLSearchParams({ page: String(page), size: String(size), ...params });
    return apiRequest<PaginatedResponse<FaturaVenda>>(`${BASE}?${search}`);
  },

  obter: (id: number) => apiRequest<FaturaVenda>(`${BASE}/${id}`),

  criar: (data: CriarFaturaVendaRequest) =>
    apiRequest<FaturaVenda>(BASE, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  atualizar: (id: number, data: Partial<CriarFaturaVendaRequest>) =>
    apiRequest<FaturaVenda>(`${BASE}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  confirmar: (id: number) =>
    apiRequest<FaturaVenda>(`${BASE}/${id}/confirmar`, { method: "PUT" }),

  excluir: (id: number) =>
    apiRequest<void>(`${BASE}/${id}`, { method: "DELETE" }),

  pdf: (id: number) =>
    apiRequest<Blob>(`${BASE}/${id}/pdf`, { headers: { Accept: "application/pdf" } }),
};
