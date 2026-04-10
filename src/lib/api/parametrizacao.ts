import type { PrFaturaTipo, PrSerie, SerieDocumento, TaxaIva } from "@/app/(myapp)/types/efatura";
import { apiRequest } from "./client";

export const parametrizacaoApi = {
  taxasIva: {
    listar: () => apiRequest<TaxaIva[]>("/taxas-iva"),
    obter: (id: number) => apiRequest<TaxaIva>(`/taxas-iva/${id}`),
    criar: (data: Omit<TaxaIva, "id">) =>
      apiRequest<TaxaIva>("/taxas-iva", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    atualizar: (id: number, data: Partial<TaxaIva>) =>
      apiRequest<TaxaIva>(`/taxas-iva/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  // Raw backend series — endpoint is under /parametrizacao/series
  series: {
    listar: () => apiRequest<PrSerie[]>("/parametrizacao/series"),
    obter: (id: number) => apiRequest<PrSerie>(`/parametrizacao/series/${id}`),
    criar: (data: Omit<SerieDocumento, "id">) =>
      apiRequest<SerieDocumento>("/parametrizacao/series", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // Tipos de fatura (FATURA, FATURA_RECIBO, etc.) with integer IDs
  tiposFatura: {
    listar: () => apiRequest<PrFaturaTipo[]>("/parametrizacao/tipos-fatura"),
  },
};
