import { apiRequest } from "./client";
import type {
  Cliente,
  Entidade,
  Fornecedor,
  PaginatedResponse,
  Produto,
} from "@/app/(myapp)/types/efatura";

type ClienteWrite = Omit<Cliente, "id" | "createdAt" | "updatedAt" | "createdBy" | "lastModifiedBy">;
type FornecedorWrite = Omit<Fornecedor, "id" | "createdAt" | "updatedAt" | "createdBy" | "lastModifiedBy">;
type ProdutoWrite = Omit<Produto, "id" | "createdAt" | "updatedAt" | "createdBy" | "lastModifiedBy">;

export const cadastroApi = {
  clientes: {
    listar: (page = 0, size = 50) =>
      apiRequest<PaginatedResponse<Cliente>>(
        `/clientes?page=${page}&size=${size}`,
      ),
    obter: (id: number) => apiRequest<Cliente>(`/clientes/${id}`),
    criar: (data: ClienteWrite) =>
      apiRequest<Cliente>("/clientes", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    atualizar: (id: number, data: Partial<Cliente>) =>
      apiRequest<Cliente>(`/clientes/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    excluir: (id: number) =>
      apiRequest<void>(`/clientes/${id}`, { method: "DELETE" }),
  },

  fornecedores: {
    listar: (page = 0, size = 50) =>
      apiRequest<PaginatedResponse<Fornecedor>>(
        `/fornecedores?page=${page}&size=${size}`,
      ),
    obter: (id: number) => apiRequest<Fornecedor>(`/fornecedores/${id}`),
    criar: (data: FornecedorWrite) =>
      apiRequest<Fornecedor>("/fornecedores", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    atualizar: (id: number, data: Partial<Fornecedor>) =>
      apiRequest<Fornecedor>(`/fornecedores/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  produtos: {
    listar: (page = 0, size = 50, search?: string) => {
      const params = new URLSearchParams({
        page: String(page),
        size: String(size),
      });
      if (search) params.set("search", search);
      return apiRequest<PaginatedResponse<Produto>>(`/produtos?${params}`);
    },
    obter: (id: number) => apiRequest<Produto>(`/produtos/${id}`),
    criar: (data: ProdutoWrite) =>
      apiRequest<Produto>("/produtos", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    atualizar: (id: number, data: Partial<Produto>) =>
      apiRequest<Produto>(`/produtos/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  entidade: {
    obter: () => apiRequest<Entidade>("/entidade"),
    atualizar: (data: Partial<Entidade>) =>
      apiRequest<Entidade>("/entidade", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },
};
