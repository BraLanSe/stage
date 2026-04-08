// ────────────────────────────────────────────────────────────
// eFatura — TypeScript Types (mirrors Spring Boot entities)
// ────────────────────────────────────────────────────────────

// ── Monetary type ────────────────────────────────────────────

/**
 * Monetary value in Cabo Verde Escudos (CVE).
 * Always stored and transmitted with at most 2 decimal places.
 * Never use raw float arithmetic on these — apply `round2()` after each
 * intermediate operation to mirror Java BigDecimal(scale=2) behaviour
 * as required by the eFatura technical specification §119.
 */
export type CVE = number;

// ── Shared ──────────────────────────────────────────────────

export type EstadoFatura = "RASCUNHO" | "CONFIRMADO";
export type PagamentoStatus = "NAO_PROCESSADO" | "PROCESSADO" | "PARCIAL";
export type DocFiscalStatus =
  | "VALIDADO"
  | "RECUSADO"
  | "PENDENTE"
  | "NAO_ENVIADO";
export type TipoCalculo = "PERCENTAGEM" | "VALOR_FIXO";

export type TipoDocumento =
  | "FATURA"
  | "FATURA_RECIBO"
  | "NOTA_CREDITO"
  | "NOTA_DEBITO"
  | "RECIBO"
  | "TALAO_VENDA"
  | "FATURA_PROFORMA";

export interface AuditFields {
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  lastModifiedBy?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ── Venda ────────────────────────────────────────────────────

export interface ItemImpostoFaturaVenda {
  id?: number;
  impostoId: number;
  impostoDesig?: string;
  tipoCalculo: TipoCalculo;
  taxa?: number; // percentage, not monetary
  valorFixo?: CVE;
  baseCalculo: CVE;
  valorImposto: CVE;
  motivoNaoAplicar?: string;
}

export interface ItemFaturaVenda {
  id?: number;
  numLinha?: number;
  produtoId?: number;
  codigoArtigo?: string;
  desig: string;
  descr?: string;
  quantidade: number; // quantity — not monetary
  unidade?: string;
  precoUnitario: CVE;
  descontoComercialPerc?: number; // percentage — not monetary
  descontoComercialValor?: CVE;
  descontoFinanceiroPerc?: number; // percentage — not monetary
  descontoFinanceiroValor?: CVE;
  valorBruto?: CVE;
  valorLiquido?: CVE;
  valorImposto?: CVE;
  valorTotal?: CVE;
  impostos?: ItemImpostoFaturaVenda[];
  // Legacy compatibility
  descricao?: string;
  percentagemIva?: number; // percentage — not monetary
  totalSemIva?: CVE;
  totalIva?: CVE;
  totalLinha?: CVE;
}

export interface FaturaVenda extends AuditFields {
  id?: number;
  codigo?: string;
  numero?: string;
  serie?: string;
  clienteId: number;
  clienteNome?: string;
  tipoDocumento: TipoDocumento;
  estado?: EstadoFatura;
  pagamentoStatus?: PagamentoStatus;
  docFiscalStatus?: DocFiscalStatus;
  dataEmissao?: string;
  dataVencimento?: string;
  condicoesPagamento?: string;
  requisicao?: string;
  descontoFinanceiro?: number; // percentage — not monetary
  descontoComercial?: number; // percentage — not monetary
  nota?: string;
  observacoes?: string;
  valorIliquido?: CVE;
  valorImposto?: CVE;
  valorFatura?: CVE;
  valorPago?: CVE;
  valorPorPagar?: CVE;
  pago?: boolean;
  subtotal?: CVE;
  totalDesconto?: CVE;
  totalIva?: CVE;
  total?: CVE;
  itens: ItemFaturaVenda[];
}

export interface CriarFaturaVendaRequest {
  clienteId: number;
  tipoDocumento: TipoDocumento;
  serie?: string;
  dataVencimento?: string;
  condicoesPagamento?: string;
  observacoes?: string;
  itens: Omit<
    ItemFaturaVenda,
    | "id"
    | "totalSemIva"
    | "totalIva"
    | "totalLinha"
    | "valorBruto"
    | "valorLiquido"
    | "valorImposto"
    | "valorTotal"
  >[];
}

// ── Compra ───────────────────────────────────────────────────

export interface ItemFaturaCompra {
  id?: number;
  desig?: string;
  descricao: string;
  quantidade: number; // quantity — not monetary
  precoUnitario: CVE;
  percentagemIva: number; // percentage — not monetary
  totalSemIva?: CVE;
  totalIva?: CVE;
  totalLinha?: CVE;
}

export interface FaturaCompra extends AuditFields {
  id?: number;
  numero?: string;
  fornecedorId: number;
  fornecedorNome?: string;
  tipoDocumento: TipoDocumento;
  estado?: EstadoFatura;
  dataEmissao?: string;
  dataVencimento?: string;
  condicoesPagamento?: string;
  observacoes?: string;
  subtotal?: CVE;
  totalIva?: CVE;
  total?: CVE;
  itens: ItemFaturaCompra[];
}

export interface CriarFaturaCompraRequest {
  fornecedorId: number;
  tipoDocumento: TipoDocumento;
  serie?: string;
  dataVencimento?: string;
  observacoes?: string;
  itens: Omit<
    ItemFaturaCompra,
    "id" | "totalSemIva" | "totalIva" | "totalLinha"
  >[];
}

// ── Parametrização ───────────────────────────────────────────

export interface TaxaIva {
  id?: number;
  codigo: string;
  descricao: string;
  percentagem: number;
  ativo: boolean;
}

export interface PrImposto {
  id?: number;
  codigo: string;
  desig: string;
  descr?: string;
  tipoCalculo: TipoCalculo;
  valor?: number;
  aplicaRetencao?: boolean;
  estado?: string;
}

export interface SerieDocumento {
  id?: number;
  codigo: string;
  descricao: string;
  tipoDocumento: TipoDocumento;
  prefixo: string;
  anoFiscal: number;
  ultimoNumero: number;
  ativo: boolean;
}

export interface MetodoPagamento {
  id?: number;
  codigo: string;
  desig: string;
  ativo: boolean;
}

// ── Cadastro ─────────────────────────────────────────────────

export type TipoEntidade = "SINGULAR" | "COLETIVO";

export interface Cliente extends AuditFields {
  id?: number;
  codigo?: string;
  nome: string;
  nif?: string;
  tipoEntidade: TipoEntidade;
  email?: string;
  telefone?: string;
  pessoaContacto?: string;
  morada?: string;
  endereco?: string;
  ilha?: string;
  conselho?: string;
  freguesia?: string;
  localidade?: string;
  descricao?: string;
  aplicarImpostos?: boolean;
  enquadramento?: string;
  ativo: boolean;
}

export interface Fornecedor extends AuditFields {
  id?: number;
  codigo?: string;
  nome: string;
  nif?: string;
  tipoEntidade: TipoEntidade;
  email?: string;
  telefone?: string;
  morada?: string;
  ilha?: string;
  conselho?: string;
  freguesia?: string;
  localidade?: string;
  ativo: boolean;
}

export interface Produto extends AuditFields {
  id?: number;
  codigo: string;
  desig: string;
  descr?: string;
  preco?: CVE;
  unidade?: string;
  categoria?: string;
  percentagemIva?: number; // percentage — not monetary
  ativo: boolean;
}

export interface Entidade extends AuditFields {
  id?: number;
  codigo?: string;
  nome: string;
  abreviacao?: string;
  nif?: string;
  email?: string;
  telefone?: string;
  registoComercial?: string;
  endereco?: string;
  ilha?: string;
  conselho?: string;
  freguesia?: string;
  localidade?: string;
  enquadramento?: string;
  pais?: string;
  logoUrl?: string;
}

// ── DFE (Documento Fiscal Eletrónico) ────────────────────────

export interface DFELed {
  codigo: number;
  descricao: string;
}

export interface EmitirDFEPayload {
  faturaId: number;
  modoAutofaturacao: boolean;
  atoIsolado: boolean;
  xmlDFE: boolean;
  iud: string;
  versao: string;
  led?: DFELed;
  serie: string;
  numDocumento: number;
  dataEmissao: string;
  horaEmissao: string;
  refEncomenda?: string;
  dataImposto: string;
  dataVencimento?: string;
  termosPagamento?: string;
}

// ── Dashboard ────────────────────────────────────────────────

export interface DashboardStats {
  totalClientes: number;
  totalFornecedores: number;
  totalProdutos: number;
  totalVendas: CVE;
  totalDespesas: CVE;
  ganhoLucro: CVE;
  variacaoVendas: number; // percentage variation
  variacaoDespesas: number; // percentage variation
  variacaoLucro: number; // percentage variation
  vendasMensais: Array<{ mes: string; vendas: CVE; compras: CVE }>;
  vendasPorMeio: Array<{ meio: string; valor: CVE; cor: string }>;
}
