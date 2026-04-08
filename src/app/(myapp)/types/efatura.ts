// ────────────────────────────────────────────────────────────
// eFatura — TypeScript Types (mirrors Spring Boot entities)
// ────────────────────────────────────────────────────────────

// ── Shared ──────────────────────────────────────────────────

export type EstadoFatura = "RASCUNHO" | "CONFIRMADO";
export type PagamentoStatus = "NAO_PROCESSADO" | "PROCESSADO" | "PARCIAL";
export type DocFiscalStatus = "VALIDADO" | "RECUSADO" | "PENDENTE" | "NAO_ENVIADO";
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
  taxa?: number;
  valorFixo?: number;
  baseCalculo: number;
  valorImposto: number;
  motivoNaoAplicar?: string;
}

export interface ItemFaturaVenda {
  id?: number;
  numLinha?: number;
  produtoId?: number;
  codigoArtigo?: string;
  desig: string;
  descr?: string;
  quantidade: number;
  unidade?: string;
  precoUnitario: number;
  descontoComercialPerc?: number;
  descontoComercialValor?: number;
  descontoFinanceiroPerc?: number;
  descontoFinanceiroValor?: number;
  valorBruto?: number;
  valorLiquido?: number;
  valorImposto?: number;
  valorTotal?: number;
  impostos?: ItemImpostoFaturaVenda[];
  // Legacy compatibility
  descricao?: string;
  percentagemIva?: number;
  totalSemIva?: number;
  totalIva?: number;
  totalLinha?: number;
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
  descontoFinanceiro?: number;
  descontoComercial?: number;
  nota?: string;
  observacoes?: string;
  valorIliquido?: number;
  valorImposto?: number;
  valorFatura?: number;
  valorPago?: number;
  valorPorPagar?: number;
  pago?: boolean;
  subtotal?: number;
  totalDesconto?: number;
  totalIva?: number;
  total?: number;
  itens: ItemFaturaVenda[];
}

export interface CriarFaturaVendaRequest {
  clienteId: number;
  tipoDocumento: TipoDocumento;
  serie?: string;
  dataVencimento?: string;
  condicoesPagamento?: string;
  observacoes?: string;
  itens: Omit<ItemFaturaVenda, "id" | "totalSemIva" | "totalIva" | "totalLinha" | "valorBruto" | "valorLiquido" | "valorImposto" | "valorTotal">[];
}

// ── Compra ───────────────────────────────────────────────────

export interface ItemFaturaCompra {
  id?: number;
  desig?: string;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
  percentagemIva: number;
  totalSemIva?: number;
  totalIva?: number;
  totalLinha?: number;
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
  observacoes?: string;
  subtotal?: number;
  totalIva?: number;
  total?: number;
  itens: ItemFaturaCompra[];
}

export interface CriarFaturaCompraRequest {
  fornecedorId: number;
  tipoDocumento: TipoDocumento;
  serie?: string;
  dataVencimento?: string;
  observacoes?: string;
  itens: Omit<ItemFaturaCompra, "id" | "totalSemIva" | "totalIva" | "totalLinha">[];
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
  preco?: number;
  unidade?: string;
  categoria?: string;
  percentagemIva?: number;
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
  totalVendas: number;
  totalDespesas: number;
  ganhoLucro: number;
  variacaoVendas: number;
  variacaoDespesas: number;
  variacaoLucro: number;
  vendasMensais: Array<{ mes: string; vendas: number; compras: number }>;
  vendasPorMeio: Array<{ meio: string; valor: number; cor: string }>;
}
