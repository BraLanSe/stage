import type {
  CriarFaturaCompraRequest,
  FaturaCompra,
  PaginatedResponse,
} from "@/app/(myapp)/types/efatura";
import { apiRequest } from "./client";

const BASE = "/faturas-compra";

export const faturasCompraApi = {
  listar: (page = 0, size = 10) =>
    apiRequest<PaginatedResponse<FaturaCompra>>(
      `${BASE}?page=${page}&size=${size}`,
    ),

  obter: (id: number) => apiRequest<FaturaCompra>(`${BASE}/${id}`),

  criar: (data: CriarFaturaCompraRequest) =>
    apiRequest<FaturaCompra>(BASE, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  atualizar: (id: number, data: Partial<CriarFaturaCompraRequest>) =>
    apiRequest<FaturaCompra>(`${BASE}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  confirmar: (id: number) =>
    apiRequest<FaturaCompra>(`${BASE}/${id}/confirmar`, { method: "PUT" }),
};
