import { apiRequest } from "./client";

const BASE = "/dados-bancarios";

export interface DadosBancarios {
  id?: number;
  banco?: string;
  nib?: string;
  iban?: string;
  swift?: string;
  titular?: string;
  estado?: string;
}

export const dadosBancariosApi = {
  listar: () => apiRequest<DadosBancarios[]>(BASE),
  obter: (id: number) => apiRequest<DadosBancarios>(`${BASE}/${id}`),
  criar: (data: DadosBancarios) =>
    apiRequest<DadosBancarios>(BASE, { method: "POST", body: JSON.stringify(data) }),
  atualizar: (id: number, data: DadosBancarios) =>
    apiRequest<DadosBancarios>(`${BASE}/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remover: (id: number) =>
    apiRequest<void>(`${BASE}/${id}`, { method: "DELETE" }),
};
