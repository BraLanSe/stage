import type { CVE, TipoEntidade } from "@/app/(myapp)/types/efatura";

export const ILHAS = [
  "SANTIAGO",
  "SÃO VICENTE",
  "SÃO ANTÃO",
  "FOGO",
  "BRAVA",
  "MAIO",
  "SAL",
  "BOA VISTA",
  "SÃO NICOLAU",
];

export const CONSELHOS: Record<string, string[]> = {
  SANTIAGO: ["PRAIA", "SANTA CATARINA", "SÃO DOMINGOS", "TARRAFAL", "SÃO MIGUEL", "RIBEIRA GRANDE DE SANTIAGO"],
  "SÃO VICENTE": ["SÃO VICENTE"],
  "SÃO ANTÃO": ["PORTO NOVO", "RIBEIRA GRANDE", "PAUL"],
  FOGO: ["SÃO FILIPE", "MOSTEIROS"],
  BRAVA: ["NOVA SINTRA"],
  MAIO: ["MAIO"],
  SAL: ["SAL"],
  "BOA VISTA": ["BOA VISTA"],
  "SÃO NICOLAU": ["RIBEIRA BRAVA", "TARRAFAL DE SÃO NICOLAU"],
};

export const TIPOS_ENTIDADE: { value: TipoEntidade; label: string }[] = [
  { value: "SINGULAR", label: "Singular" },
  { value: "COLETIVO", label: "Coletivo" },
];

export function formatCVE(v: CVE | undefined | null): string {
  if (v == null || Number.isNaN(v)) return "—";
  return new Intl.NumberFormat("pt-CV", {
    style: "currency",
    currency: "CVE",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}
