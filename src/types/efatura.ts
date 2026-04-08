import { z } from "zod";

export const ImpostoSchema = z.object({
  id: z.string(),
  taxa: z.number(),
  tipoCalculo: z.enum(['PERCENTAGE', 'FIXED'])
});

export const FaturaItemSchema = z.object({
  PRODUTO_ID: z.string().optional(),
  DESIG: z.string().min(1, "A descrição é obrigatória"),
  QUANTIDADE: z.number().min(0.01, "Quantidade deve ser maior que 0"),
  pr_unidade_ID: z.string().optional(),
  PRECO_UNITARIO: z.number().min(0, "Preço deve ser maior ou igual a 0"),
  DESCONTO_COMERCIAL_PERC: z.number().min(0).max(100).optional().default(0),
  IMPOSTO: ImpostoSchema.optional(),
  
  // Valores calculados
  VALOR_BRUTO: z.number().optional(),
  VALOR_LIQUIDO: z.number().optional(),
  VALOR_IMPOSTO: z.number().optional(),
  VALOR_TOTAL: z.number().optional(),
});

export const FaturaSchema = z.object({
  // Cabeçalho
  CLIENTE_ID: z.string().min(1, "Cliente é obrigatório"),
  pr_serie_ID: z.string().min(1, "Série documental é obrigatória"),
  TIPO_FATURA: z.string().min(1, "Tipo de fatura é obrigatório"),
  DT_FATURACAO: z.string().min(1, "Data de faturamento é obrigatória"),
  DT_VENCIMENTO_FATURA: z.string().optional(),
  NOTA: z.string().optional(),
  TERM_CONDICOES: z.string().optional(),

  // Itens
  itens: z.array(FaturaItemSchema).min(1, "Adicione pelo menos um item à fatura"),

  // Resumo
  VALOR_ILIQUIDO: z.number().optional(),
  VALOR_IMPOSTO: z.number().optional(),
  VALOR_FATURA: z.number().optional(),
});

export type Imposto = z.infer<typeof ImpostoSchema>;
export type FaturaItem = z.infer<typeof FaturaItemSchema>;
export type FaturaData = z.infer<typeof FaturaSchema>;