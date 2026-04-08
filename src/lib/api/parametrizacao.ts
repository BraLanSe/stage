import type { SerieDocumento, TaxaIva } from "@/app/(myapp)/types/efatura";
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

  series: {
    listar: () => apiRequest<SerieDocumento[]>("/series"),
    obter: (id: number) => apiRequest<SerieDocumento>(`/series/${id}`),
    criar: (data: Omit<SerieDocumento, "id">) =>
      apiRequest<SerieDocumento>("/series", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
};
