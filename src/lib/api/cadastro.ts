import type {
  Cliente,
  Entidade,
  Fornecedor,
  PaginatedResponse,
  Produto,
} from "@/app/(myapp)/types/efatura";
import { apiRequest } from "./client";

type ClienteWrite = Omit<
  Cliente,
  "id" | "createdAt" | "updatedAt" | "createdBy" | "lastModifiedBy"
>;
type FornecedorWrite = Omit<
  Fornecedor,
  "id" | "createdAt" | "updatedAt" | "createdBy" | "lastModifiedBy"
>;
type ProdutoWrite = Omit<
  Produto,
  "id" | "createdAt" | "updatedAt" | "createdBy" | "lastModifiedBy"
>;

// ── Helpers ───────────────────────────────────────────────────

/** Remove empty strings, undefined and null before JSON.stringify. */
function sanitize(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );
}

/**
 * Maps the frontend `ClienteWrite` shape → `ClienteCreateDTO` (Spring Boot).
 *
 * Field renames / type casts required by the backend:
 *   nome        → desig          (@NotBlank — was the root cause of 400)
 *   tipoEntidade → indColetivo   (String enum → Boolean: COLETIVO=true)
 *   ativo        → estado        (Boolean → "ATIVO" | "INATIVO")
 *   descricao    → descr         (renamed)
 *   morada       → endereco      (fallback only; `endereco` takes priority)
 *   nif          → digits only   (strip non-numeric chars)
 *   codigo       → auto-generated if blank on creation ("CLI-{timestamp}")
 */
function toClienteDTO(
  data: ClienteWrite | Partial<Cliente>,
  isCreate = false,
): Record<string, unknown> {
  const d = data as Record<string, unknown>;
  const rawNif = (d.nif as string | undefined) ?? "";
  const nif = rawNif.replace(/\D/g, "") || undefined;

  const codigoRaw = (d.codigo as string | undefined)?.trim();
  const codigo = codigoRaw || (isCreate ? `C-${Math.floor(10000000 + Math.random() * 90000000)}` : undefined);

  return sanitize({
    codigo,
    desig: d.nome,
    indColetivo: d.tipoEntidade === "COLETIVO"
      ? true
      : d.tipoEntidade === "SINGULAR"
        ? false
        : undefined,
    descr: d.descricao,
    nif,
    email: d.email,
    telefone: d.telefone,
    pessoaContacto: d.pessoaContacto,
    // `endereco` field on the DTO; fall back to `morada` if absent
    endereco: (d.endereco as string | undefined) || (d.morada as string | undefined),
    aplicarImpostos: (d.aplicarImpostos as boolean | undefined) ?? true,
    estado: d.ativo === true ? "ATIVO" : d.ativo === false ? "INATIVO" : undefined,
    pais: "CPV",
  });
}

/**
 * Maps the frontend `FornecedorWrite` shape → `FornecedorCreateDTO` (Spring Boot).
 * Identical field structure to ClienteCreateDTO — same renames apply:
 *   nome        → desig         (@NotBlank)
 *   tipoEntidade → indColetivo  (Boolean: COLETIVO=true)
 *   ativo        → estado       ("ATIVO" | "INATIVO")
 *   descricao    → descr
 *   morada       → endereco     (fallback)
 *   nif          → digits only
 *   codigo       → auto-generated "F-{8digits}" if blank (VARCHAR 10)
 */
function toFornecedorDTO(
  data: FornecedorWrite | Partial<Fornecedor>,
  isCreate = false,
): Record<string, unknown> {
  const d = data as Record<string, unknown>;
  const rawNif = (d.nif as string | undefined) ?? "";
  const nif = rawNif.replace(/\D/g, "") || undefined;

  const codigoRaw = (d.codigo as string | undefined)?.trim();
  const codigo = codigoRaw || (isCreate ? `F-${Math.floor(10000000 + Math.random() * 90000000)}` : undefined);

  return sanitize({
    codigo,
    desig: d.nome,
    indColetivo: d.tipoEntidade === "COLETIVO"
      ? true
      : d.tipoEntidade === "SINGULAR"
        ? false
        : undefined,
    descr: d.descricao,
    nif,
    email: d.email,
    telefone: d.telefone,
    pessoaContacto: d.pessoaContacto,
    endereco: (d.endereco as string | undefined) || (d.morada as string | undefined),
    aplicarImpostos: (d.aplicarImpostos as boolean | undefined) ?? true,
    estado: d.ativo === true ? "ATIVO" : d.ativo === false ? "INATIVO" : undefined,
    pais: "CPV",
  });
}

// ── API ───────────────────────────────────────────────────────

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
        body: JSON.stringify(toClienteDTO(data, true)),
      }),
    atualizar: (id: number, data: Partial<Cliente>) =>
      apiRequest<Cliente>(`/clientes/${id}`, {
        method: "PUT",
        body: JSON.stringify(toClienteDTO(data)),
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
        body: JSON.stringify(toFornecedorDTO(data, true)),
      }),
    atualizar: (id: number, data: Partial<Fornecedor>) =>
      apiRequest<Fornecedor>(`/fornecedores/${id}`, {
        method: "PUT",
        body: JSON.stringify(toFornecedorDTO(data)),
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
        body: JSON.stringify(sanitize(data as Record<string, unknown>)),
      }),
    atualizar: (id: number, data: Partial<Produto>) =>
      apiRequest<Produto>(`/produtos/${id}`, {
        method: "PUT",
        body: JSON.stringify(sanitize(data as Record<string, unknown>)),
      }),
  },

  entidade: {
    obter: () => apiRequest<Entidade>("/entidade"),
    atualizar: (data: Partial<Entidade>) =>
      apiRequest<Entidade>("/entidade", {
        method: "PUT",
        body: JSON.stringify(sanitize(data as Record<string, unknown>)),
      }),
  },
};
