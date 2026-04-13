import type {
  CriarFaturaVendaRequest,
  FaturaVenda,
  PaginatedResponse,
} from "@/app/(myapp)/types/efatura";
import { apiRequest } from "./client";

const BASE = "/faturas-venda";

function toFaturaVendaDTO(data: CriarFaturaVendaRequest): Record<string, unknown> {
  const today = new Date().toISOString().split("T")[0];

  const items = (data.itens ?? []).map((item, idx) => {
    const row: Record<string, unknown> = {
      numLinha: item.numLinha ?? idx + 1,
      desig: item.desig || (item as Record<string, unknown>).descricao || "",
      quantidade: parseFloat(String(item.quantidade)),
      precoUnitario: parseFloat(String(item.precoUnitario)),
      impostos: [],
    };
    if (item.produtoId) row.produtoId = item.produtoId;
    if (item.codigoArtigo) row.codigoArtigo = item.codigoArtigo;
    if (item.descr) row.descr = item.descr;
    if (item.descontoComercialPerc) row.descontoComercialPerc = parseFloat(String(item.descontoComercialPerc));
    if (item.descontoFinanceiroPerc) row.descontoFinanceiroPerc = parseFloat(String(item.descontoFinanceiroPerc));
    return row;
  });

  const dto: Record<string, unknown> = {
    tipoFaturaId: data.tipoFaturaId,
    prSerieId: data.prSerieId,
    dtFaturacao: today,
    clienteId: data.clienteId,
    items,
  };
  if (data.dataVencimento) dto.dtVencimentoFatura = data.dataVencimento;
  if (data.condicoesPagamento) dto.termCondicoes = data.condicoesPagamento;
  if (data.observacoes) dto.nota = data.observacoes;
  return dto;
}

export const faturasVendaApi = {
  listar: (page = 0, size = 10, params?: Record<string, string>) => {
    const search = new URLSearchParams({
      page: String(page),
      size: String(size),
      ...params,
    });
    return apiRequest<PaginatedResponse<FaturaVenda>>(`${BASE}?${search}`);
  },

  obter: (id: number) => apiRequest<FaturaVenda>(`${BASE}/${id}`),

  criar: (data: CriarFaturaVendaRequest) =>
    apiRequest<FaturaVenda>(BASE, {
      method: "POST",
      body: JSON.stringify(toFaturaVendaDTO(data)),
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
    apiRequest<Blob>(`${BASE}/${id}/pdf`, {
      headers: { Accept: "application/pdf" },
    }),
};
