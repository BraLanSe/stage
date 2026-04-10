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

/** Strip empty strings, undefined and null — prevents Jackson 400 errors. */
function sanitize(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );
}

// ── Write mappers (frontend → ClienteCreateDTO / FornecedorCreateDTO) ────────

/**
 * Maps ClienteWrite → ClienteCreateDTO (Spring Boot).
 * Key casts:
 *   tipoEntidade → indColetivo  (Boolean @NotNull: COLETIVO=true)
 *   ativo        → estado       ("ATIVO" | "INATIVO")
 *   desig        → desig        (same field — @NotBlank)
 *   codigo       → auto-generated "C-{8digits}" on creation (VARCHAR 10)
 *   nif          → digits only
 */
function toClienteDTO(
  data: ClienteWrite | Partial<Cliente>,
  isCreate = false,
): Record<string, unknown> {
  const d = data as Record<string, unknown>;
  const nif = ((d.nif as string | undefined) ?? "").replace(/\D/g, "") || undefined;
  const codigoRaw = (d.codigo as string | undefined)?.trim();
  const codigo = codigoRaw || (isCreate ? `C-${Math.floor(10000000 + Math.random() * 90000000)}` : undefined);

  return sanitize({
    codigo,
    desig: d.desig,
    indColetivo: d.tipoEntidade === "COLETIVO" ? true : d.tipoEntidade === "SINGULAR" ? false : undefined,
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

/** Maps FornecedorWrite → FornecedorCreateDTO. Same field mapping as Cliente. */
function toFornecedorDTO(
  data: FornecedorWrite | Partial<Fornecedor>,
  isCreate = false,
): Record<string, unknown> {
  const d = data as Record<string, unknown>;
  const nif = ((d.nif as string | undefined) ?? "").replace(/\D/g, "") || undefined;
  const codigoRaw = (d.codigo as string | undefined)?.trim();
  const codigo = codigoRaw || (isCreate ? `F-${Math.floor(10000000 + Math.random() * 90000000)}` : undefined);

  return sanitize({
    codigo,
    desig: d.desig,
    indColetivo: d.tipoEntidade === "COLETIVO" ? true : d.tipoEntidade === "SINGULAR" ? false : undefined,
    nif,
    email: d.email,
    telefone: d.telefone,
    endereco: (d.endereco as string | undefined) || (d.morada as string | undefined),
    aplicarImpostos: (d.aplicarImpostos as boolean | undefined) ?? true,
    estado: d.ativo === true ? "ATIVO" : d.ativo === false ? "INATIVO" : undefined,
    pais: "CPV",
  });
}

// ── Read mappers (ClienteEntity / FornecedorEntity → frontend types) ─────────

// biome-ignore lint/suspicious/noExplicitAny: raw backend DTO
function fromClienteDTO(dto: any): Cliente {
  return {
    id: dto.id,
    codigo: dto.codigo,
    desig: dto.desig ?? "",
    tipoEntidade: dto.indColetivo ? "COLETIVO" : "SINGULAR",
    ativo: dto.estado === "ATIVO",
    nif: dto.nif,
    email: dto.email,
    telefone: dto.telefone,
    pessoaContacto: dto.pessoaContacto,
    endereco: dto.endereco,
    descricao: dto.descr,
    aplicarImpostos: dto.aplicarImpostos ?? true,
    ilha: undefined,
    conselho: undefined,
    freguesia: undefined,
    localidade: undefined,
    morada: undefined,
    enquadramento: undefined,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    createdBy: dto.createdBy,
    lastModifiedBy: dto.lastModifiedBy,
  };
}

// biome-ignore lint/suspicious/noExplicitAny: raw backend DTO
function fromFornecedorDTO(dto: any): Fornecedor {
  return {
    id: dto.id,
    codigo: dto.codigo,
    desig: dto.desig ?? "",
    tipoEntidade: dto.indColetivo ? "COLETIVO" : "SINGULAR",
    ativo: dto.estado === "ATIVO",
    nif: dto.nif,
    email: dto.email,
    telefone: dto.telefone,
    morada: dto.endereco,
    ilha: undefined,
    conselho: undefined,
    freguesia: undefined,
    localidade: undefined,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    createdBy: dto.createdBy,
    lastModifiedBy: dto.lastModifiedBy,
  };
}

/**
 * Normalises list responses to PaginatedResponse<T>.
 * Handles both Spring Page<Entity> objects and legacy plain arrays.
 */
function wrapList<T>(
  raw: unknown,
  // biome-ignore lint/suspicious/noExplicitAny: raw backend DTO
  mapper: (dto: any) => T,
): PaginatedResponse<T> {
  if (Array.isArray(raw)) {
    const content = raw.map(mapper);
    return { content, totalElements: content.length, totalPages: 1, size: content.length, number: 0, first: true, last: true, empty: content.length === 0 };
  }
  const paged = raw as { content?: unknown[] } & Record<string, unknown>;
  return { ...paged, content: (paged.content ?? []).map(mapper) } as PaginatedResponse<T>;
}

// ── API ───────────────────────────────────────────────────────

export const cadastroApi = {
  clientes: {
    listar: async (page = 0, size = 50) => {
      const raw = await apiRequest<unknown>(`/clientes?page=${page}&size=${size}`);
      return wrapList(raw, fromClienteDTO);
    },
    obter: async (id: number) => fromClienteDTO(await apiRequest<unknown>(`/clientes/${id}`)),
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
    listar: async (page = 0, size = 50) => {
      const raw = await apiRequest<unknown>(`/fornecedores?page=${page}&size=${size}`);
      return wrapList(raw, fromFornecedorDTO);
    },
    obter: async (id: number) => fromFornecedorDTO(await apiRequest<unknown>(`/fornecedores/${id}`)),
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
      const params = new URLSearchParams({ page: String(page), size: String(size) });
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
