import type {
  CriarFaturaCompraRequest,
  FaturaCompraReadDTO,
  PaginatedResponse,
} from "@/app/(myapp)/types/efatura";
import { apiRequest } from "./client";

const BASE = "/faturas-compra";

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

function toFaturaCompraDTO(data: CriarFaturaCompraRequest): Record<string, unknown> {
  const today = new Date().toISOString().split("T")[0];

  const items = (data.itens ?? []).map((item, idx) => {
    const desig = String(
      (item as Record<string, unknown>).desig ||
      (item as Record<string, unknown>).descricao ||
      "",
    );
    const row: Record<string, unknown> = {
      numLinha: idx + 1,
      desig,
      quantidade: parseFloat(String(item.quantidade)),
      precoUnitario: parseFloat(String(item.precoUnitario)),
    };
    if ((item as Record<string, unknown>).descr) {
      row.descr = (item as Record<string, unknown>).descr;
    }
    return row;
  });

  const valorIliquido = round2(
    (data.itens ?? []).reduce(
      (acc, item) =>
        acc +
        round2(parseFloat(String(item.quantidade)) * parseFloat(String(item.precoUnitario))),
      0,
    ),
  );
  const valorImposto = round2(
    (data.itens ?? []).reduce((acc, item) => {
      const base = round2(
        parseFloat(String(item.quantidade)) * parseFloat(String(item.precoUnitario)),
      );
      const iva = parseFloat(String(item.percentagemIva ?? 0));
      return acc + round2(base * (iva / 100));
    }, 0),
  );

  const dto: Record<string, unknown> = {
    fornecedorId: data.fornecedorId,
    tipoFaturaId: data.tipoFaturaId,
    prSerieId: data.prSerieId,
    dtFaturacao: today,
    valorIliquido,
    valorImposto,
    valorFatura: round2(valorIliquido + valorImposto),
    items,
  };
  if (data.meioPagamento)   dto.meioPagamento   = data.meioPagamento;
  if (data.dataVencimento)  dto.dtVencimentoFatura = data.dataVencimento;
  if (data.observacoes)     dto.nota            = data.observacoes;
  if (data.fornecedorBanco) dto.fornecedorBanco = data.fornecedorBanco;
  if (data.fornecedorIban)  dto.fornecedorIban  = data.fornecedorIban;
  if (data.nossoBanco)      dto.nossoBanco      = data.nossoBanco;
  if (data.nossoIban)       dto.nossoIban       = data.nossoIban;
  return dto;
}

export const faturasCompraApi = {
  listar: (page = 0, size = 10) =>
    apiRequest<PaginatedResponse<FaturaCompraReadDTO>>(
      `${BASE}?page=${page}&size=${size}`,
    ),

  obter: (id: number) => apiRequest<FaturaCompraReadDTO>(`${BASE}/${id}`),

  criar: (data: CriarFaturaCompraRequest) => {
    const dto = toFaturaCompraDTO(data);
    return apiRequest<FaturaCompraReadDTO>(BASE, {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },

  atualizar: (
    id: number,
    data: {
      fornecedorId?: number;
      nota?: string;
      termCondicoes?: string;
      items?: {
        desig: string;
        descr?: string;
        quantidade: number;
        precoUnitario: number;
        percentagemIva?: number;
      }[];
    },
  ) =>
    apiRequest<FaturaCompraReadDTO>(`${BASE}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  confirmar: (id: number) =>
    apiRequest<FaturaCompraReadDTO>(`${BASE}/${id}/confirmar`, { method: "PUT" }),
};
