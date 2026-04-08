import { z } from 'zod';

// Nota sobre decimais: O JavaScript usa double-precision floats.
// Para cálculos precisos no frontend (como exigido no doc), recomenda-se
// usar uma biblioteca como decimal.js ou big.js após a validação.
// Aqui na validação Zod usamos `z.number()` para receber os dados numéricos.

// 8.1. entidade
export const EntidadeSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  codigo: z.string().min(1, "Código é obrigatório"),
  desig: z.string().min(1, "Designação é obrigatória"),
  descr: z.string().optional(),
  nif: z.string().min(1, "NIF é obrigatório"),
  email: z.string().email("Email inválido").optional().nullable(),
  telefone: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  geografiaId: z.string().optional().nullable(),
  prEnquadramentoId: z.string().min(1, "Enquadramento é obrigatório"),
  prPaisId: z.string().optional().nullable(),
  prMoedaId: z.string().optional().nullable(),
  dtRegisto: z.coerce.date(),
  dtAlteracao: z.coerce.date(),
  estado: z.string().min(1, "Estado é obrigatório"),
});
export type Entidade = z.infer<typeof EntidadeSchema>;

// 8.2. cliente
export const ClienteSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  codigo: z.string().min(1, "Código é obrigatório"),
  indColetivo: z.boolean(),
  desig: z.string().min(1, "Designação é obrigatória"),
  descr: z.string().optional().nullable(),
  nif: z.string().optional().nullable(),
  numCliente: z.string().optional().nullable(),
  email: z.string().email("Email inválido").optional().nullable(),
  telefone: z.string().optional().nullable(),
  geografiaId: z.string().optional().nullable(),
  pais: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  pessoaContacto: z.string().optional().nullable(),
  aplicarImpostos: z.boolean(),
  motivoNaoAplicarImposto: z.string().optional().nullable(),
  prEnquadramentoId: z.string().optional().nullable(),
  contaGlId: z.string().optional().nullable(),
  dtRegisto: z.coerce.date(),
  dtAlteracao: z.coerce.date(),
  estado: z.string().min(1, "Estado é obrigatório"),
});
export type Cliente = z.infer<typeof ClienteSchema>;

// 8.3. fornecedor
export const FornecedorSchema = ClienteSchema.extend({
  // Mesma lógica do cliente adaptada ao ciclo de compras,
  // já inclui contaGlId e remove entidadeId na base.
});
export type Fornecedor = z.infer<typeof FornecedorSchema>;

// 8.4. produto
export const ProdutoSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  codigo: z.string().min(1, "Código é obrigatório"),
  desig: z.string().min(1, "Designação é obrigatória"),
  descr: z.string().optional().nullable(),
  prCategoriaId: z.string().optional().nullable(),
  prUnidadeId: z.string().optional().nullable(),
  preco: z.number(), // Valor Monetário
  impostoVendaId: z.string().optional().nullable(),
  impostoCompraId: z.string().optional().nullable(),
  descontoComercial: z.number().optional().nullable(),
  controlarStock: z.boolean().optional().nullable(),
  contaGlId: z.string().optional().nullable(),
  contaGlCompraId: z.string().optional().nullable(),
  dtRegisto: z.coerce.date(),
  dtAlteracao: z.coerce.date(),
  estado: z.string().min(1, "Estado é obrigatório"),
});
export type Produto = z.infer<typeof ProdutoSchema>;

// 8.5. pr_imposto
export const TipoCalculoEnum = z.enum(['PERCENTAGEM', 'VALOR_FIXO']);

export const PrImpostoSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  codigo: z.string().min(1, "Código é obrigatório"),
  desig: z.string().min(1, "Designação é obrigatória"),
  descr: z.string().optional().nullable(),
  tipoCalculo: TipoCalculoEnum,
  valor: z.number().optional().nullable(),
  aplicaRetencao: z.boolean().optional().nullable(),
  contaGlId: z.string().optional().nullable(),
  estado: z.string().min(1, "Estado é obrigatório"),
});
export type PrImposto = z.infer<typeof PrImpostoSchema>;

// 8.6. fatura_venda
export const FaturaVendaSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  codigo: z.string().min(1, "Código é obrigatório"),
  codigoReferencia: z.string().optional().nullable(),
  tipoFatura: z.string().min(1, "Tipo de fatura é obrigatório"),
  dtFaturacao: z.coerce.date(),
  limitFaturacao: z.coerce.date().optional().nullable(),
  dtVencimentoFatura: z.coerce.date().optional().nullable(),
  estado: z.string().min(1, "Estado é obrigatório"),
  pago: z.boolean(),
  descontoFinanceiro: z.number().optional().nullable(),
  descontoComercial: z.number().optional().nullable(),
  valorIliquido: z.number(),
  valorImposto: z.number(),
  valorFatura: z.number(),
  valorPago: z.number(),
  valorPorPagar: z.number(),
  faturaVendaId: z.string().optional().nullable(),
  termCondicoes: z.string().optional().nullable(),
  nota: z.string().optional().nullable(),
  clienteId: z.string().min(1, "Cliente é obrigatório"),
  prSerieId: z.string().min(1, "Série é obrigatória"),
  utilizador: z.string().min(1, "Utilizador é obrigatório"),
  dtRegisto: z.coerce.date(),
  dtAlteracao: z.coerce.date(),
});
export type FaturaVenda = z.infer<typeof FaturaVendaSchema>;

// 8.7. fatura_venda_item
export const FaturaVendaItemSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  faturaVendaId: z.string().min(1, "Fatura Venda ID é obrigatório"),
  numLinha: z.number().int(),
  produtoId: z.string().optional().nullable(),
  codigoArtigo: z.string().optional().nullable(),
  desig: z.string().min(1, "Designação é obrigatória"),
  descr: z.string().optional().nullable(),
  quantidade: z.number(),
  prUnidadeId: z.string().optional().nullable(),
  precoUnitario: z.number(),
  descontoComercialPerc: z.number().optional().nullable(),
  descontoComercialValor: z.number().optional().nullable(),
  descontoFinanceiroPerc: z.number().optional().nullable(),
  descontoFinanceiroValor: z.number().optional().nullable(),
  valorBruto: z.number(),
  valorLiquido: z.number(),
  valorImposto: z.number(),
  valorTotal: z.number(),
  contaGlId: z.string().optional().nullable(),
  dtRegisto: z.coerce.date(),
  dtAlteracao: z.coerce.date(),
  estado: z.string().min(1, "Estado é obrigatório"),
});
export type FaturaVendaItem = z.infer<typeof FaturaVendaItemSchema>;

// 8.8. fatura_venda_item_imposto
export const FaturaVendaItemImpostoSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  faturaVendaItemId: z.string().min(1, "Item da Fatura é obrigatório"),
  impostoId: z.string().min(1, "Imposto é obrigatório"),
  tipoCalculo: TipoCalculoEnum,
  taxa: z.number().optional().nullable(),
  valorFixo: z.number().optional().nullable(),
  baseCalculo: z.number(),
  valorImposto: z.number(),
  motivoNaoAplicarImposto: z.string().optional().nullable(),
  contaGlId: z.string().optional().nullable(),
  ordem: z.number().int().optional().nullable(),
});
export type FaturaVendaItemImposto = z.infer<typeof FaturaVendaItemImpostoSchema>;

// 8.9. fatura_compra e tabelas associadas
export const FaturaCompraSchema = FaturaVendaSchema.extend({
  clienteId: z.undefined(), 
  fornecedorId: z.string().min(1, "Fornecedor é obrigatório"),
  faturaVendaId: z.undefined(),
  faturaCompraId: z.string().optional().nullable(),
});
export type FaturaCompra = z.infer<typeof FaturaCompraSchema>;

export const FaturaCompraItemSchema = FaturaVendaItemSchema.extend({
  faturaVendaId: z.undefined(),
  faturaCompraId: z.string().min(1, "Fatura Compra ID é obrigatório"),
});
export type FaturaCompraItem = z.infer<typeof FaturaCompraItemSchema>;

export const FaturaCompraItemImpostoSchema = FaturaVendaItemImpostoSchema.extend({
  faturaVendaItemId: z.undefined(),
  faturaCompraItemId: z.string().min(1, "Item da Fatura de Compra é obrigatório"),
});
export type FaturaCompraItemImposto = z.infer<typeof FaturaCompraItemImpostoSchema>;

// 8.10. pagamento
export const PagamentoSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  codigo: z.string().min(1, "Código é obrigatório"),
  banco: z.string().optional().nullable(),
  valorPagamento: z.number(),
  numDocumento: z.string().optional().nullable(),
  tipoPagamento: z.string().min(1, "Tipo de pagamento é obrigatório"),
  agenciaId: z.string().optional().nullable(),
  axexoComprovativo: z.string().optional().nullable(),
  nota: z.string().optional().nullable(),
  dtPagamento: z.coerce.date(),
  utilizador: z.string().min(1, "Utilizador é obrigatório"),
  dtRegisto: z.coerce.date(),
  dtAlteracao: z.coerce.date(),
  estado: z.string().min(1, "Estado é obrigatório"),
  codigoReferencia: z.string().optional().nullable(),
});
export type Pagamento = z.infer<typeof PagamentoSchema>;

// 8.11. pagamento_documento
export const PagamentoDocumentoSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  pagamentoId: z.string().min(1, "Pagamento ID é obrigatório"),
  faturaVendaId: z.string().optional().nullable(),
  faturaCompraId: z.string().optional().nullable(),
  valorAplicado: z.number(),
  descontoFinanceiroAplicado: z.number().optional().nullable(),
  regularizacaoRefCod: z.string().optional().nullable(),
  dtRegisto: z.coerce.date(),
});
export type PagamentoDocumento = z.infer<typeof PagamentoDocumentoSchema>;

// 8.12. gl_conta
export const TipoContaEnum = z.enum(['Ativo', 'Passivo', 'Capital', 'Rendimento', 'Gasto']);

export const GlContaSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  codigo: z.string().min(1, "Código é obrigatório"),
  desig: z.string().min(1, "Designação é obrigatória"),
  descr: z.string().optional().nullable(),
  tipoConta: TipoContaEnum,
  contaPaiId: z.string().optional().nullable(),
  aceitaLancamento: z.boolean(),
  dtRegisto: z.coerce.date(),
  dtAlteracao: z.coerce.date(),
  estado: z.string().min(1, "Estado é obrigatório"),
});
export type GlConta = z.infer<typeof GlContaSchema>;
