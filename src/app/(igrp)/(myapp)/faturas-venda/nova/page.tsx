/* IGRP-GENERATED-PAGE */
"use client";

/* IGRP-CUSTOM-CODE-BEGIN(imports) */
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IGRPButton,
  IGRPCard,
  IGRPCardContent,
  IGRPContainer,
  IGRPInputNumber,
  IGRPInputText,
  IGRPPageHeader,
  IGRPSelect,
  IGRPTableBodyPrimitive,
  IGRPTableCellPrimitive,
  IGRPTableHeadPrimitive,
  IGRPTableHeaderPrimitive,
  IGRPTablePrimitive,
  IGRPTableRowPrimitive,
  IGRPTextarea,
} from "@igrp/igrp-framework-react-design-system";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4";
import { useClientes, useProdutos } from "@/hooks/use-cadastro";
import { useCriarFaturaVenda } from "@/hooks/use-faturas-venda";
import { parametrizacaoApi } from "@/lib/api/parametrizacao";
/* IGRP-CUSTOM-CODE-END */

/* IGRP-CUSTOM-CODE-BEGIN(schema) */
const itemSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória"),
  quantidade: z
    .number({ error: "Quantidade inválida" })
    .positive("A quantidade deve ser superior a 0"),
  precoUnitario: z.number({ error: "Preço inválido" }).min(0, "O preço não pode ser negativo"),
  percentagemIva: z.number({ error: "IVA inválido" }).min(0, "IVA não pode ser negativo").max(100, "IVA não pode exceder 100%"),
  descontoPerc: z.number().min(0).max(100).optional(),
  descontoValor: z.number().min(0).optional(),
});

const MEIOS_PAGAMENTO = [
  { label: "Dinheiro (Liquide)",    value: "Dinheiro" },
  { label: "Cheque",                value: "Cheque" },
  { label: "Cartão Vinte4 (Carte)", value: "CartaoVinte4" },
] as const;

const schema = z.object({
  clienteId: z.number({ error: "Selecione um cliente" }),
  tipoFaturaId: z.number({ error: "Selecione o tipo de documento" }),
  prSerieId: z.number({ error: "Selecione uma série" }),
  meioPagamento: z.string().optional(),
  dataVencimento: z.string().optional(),
  observacoes: z.string().optional(),
  itens: z.array(itemSchema).min(1, "Adicione pelo menos um item"),
});

type FormValues = z.infer<typeof schema>;
/* IGRP-CUSTOM-CODE-END */

/* IGRP-CUSTOM-CODE-BEGIN(helpers) */
function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

function n(v: number | undefined | null): number {
  const x = Number(v);
  return Number.isNaN(x) ? 0 : x;
}

/**
 * Calculates HT base, IVA, and total for a line item.
 * descontoPerc is applied to the TTC base before extracting HT — identical
 * percentage applied to either HT or TTC yields the same ratio.
 */
function calcItem(qty: number, priceTTC: number, ivaPerc: number, descontoPerc = 0) {
  const baseTTC  = round2(qty * priceTTC);
  const discTTC  = round2(baseTTC * descontoPerc / 100);
  const netTTC   = round2(baseTTC - discTTC);
  const netHT    = round2(netTTC / (1 + ivaPerc / 100));
  const imposto  = round2(netHT * ivaPerc / 100);
  return { bruto: netHT, imposto, total: round2(netHT + imposto) };
}

function formatCVE(v: number) {
  if (Number.isNaN(v)) return "0,00 CVE";
  return new Intl.NumberFormat("pt-CV", {
    style: "currency",
    currency: "CVE",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

function formatCVEInt(v: number) {
  if (Number.isNaN(v)) return "0 CVE";
  return new Intl.NumberFormat("pt-CV", {
    style: "currency",
    currency: "CVE",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v);
}
/* IGRP-CUSTOM-CODE-END */

export default function NovaFaturaVendaPage() {
  /* IGRP-CUSTOM-CODE-BEGIN(hooks) */
  const router = useRouter();
  const { mutateAsync: criar, isPending } = useCriarFaturaVenda();
  const { data: clientesPage } = useClientes();
  const clientes = clientesPage?.content ?? [];
  const { data: produtosPage } = useProdutos(0, 100);
  const produtos = produtosPage?.content ?? [];

  const { data: tiposFaturaData, isLoading: tiposFaturaLoading } = useQuery({
    queryKey: ["parametrizacao", "tipos-fatura"],
    queryFn: () => parametrizacaoApi.tiposFatura.listar(),
  });
  const { data: seriesData, isLoading: seriesLoading } = useQuery({
    queryKey: ["parametrizacao", "series"],
    queryFn: () => parametrizacaoApi.series.listar(),
  });
  const tiposFatura = Array.isArray(tiposFaturaData)
    ? tiposFaturaData
    : ((tiposFaturaData as unknown as { content?: typeof tiposFaturaData })?.content ?? []);
  const series = Array.isArray(seriesData)
    ? seriesData
    : ((seriesData as unknown as { content?: typeof seriesData })?.content ?? []);

  const [addProdutoId, setAddProdutoId] = useState<string>("");
  const [addQty, setAddQty] = useState<number>(1);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      itens: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "itens" });
  const watchedItens = watch("itens") || [];

  const { valorIliquido, valorImposto, valorTotal } = watchedItens.reduce(
    (acc, item) => {
      const { bruto, imposto, total } = calcItem(
        n(item?.quantidade),
        n(item?.precoUnitario),
        n(item?.percentagemIva),
        n(item?.descontoPerc),
      );
      return {
        valorIliquido: round2(acc.valorIliquido + bruto),
        valorImposto:  round2(acc.valorImposto  + imposto),
        valorTotal:    round2(acc.valorTotal    + total),
      };
    },
    { valorIliquido: 0, valorImposto: 0, valorTotal: 0 },
  );
  const valorTotalFinal = Math.round(valorTotal);

  function handleAdicionarProduto() {
    const produto = produtos.find((p) => String(p.id) === addProdutoId);
    if (!produto) return;
    append({
      descricao: produto.desig,
      quantidade: addQty,
      precoUnitario: produto.preco ?? 0,
      percentagemIva: 15,
      descontoPerc: 0,
      descontoValor: 0,
    });
    setAddProdutoId("");
    setAddQty(1);
  }

  async function onSubmit(values: FormValues) {
    try {
      const fatura = await criar({
        clienteId: values.clienteId,
        tipoFaturaId: values.tipoFaturaId,
        prSerieId: values.prSerieId,
        meioPagamento: values.meioPagamento,
        dataVencimento: values.dataVencimento,
        observacoes: values.observacoes,
        itens: values.itens.map(
          ({ descricao, quantidade, precoUnitario, percentagemIva, descontoPerc }) => ({
            desig: descricao,
            quantidade,
            precoUnitario: round2(precoUnitario / (1 + percentagemIva / 100)),
            percentagemIva,
            descontoComercialPerc: round2(descontoPerc ?? 0),
          }),
        ),
      });
      toast.success("Fatura criada com sucesso!");
      router.push(`/faturas-venda/${fatura.id}`);
    } catch (error) {
      toast.error(
        "Erro ao criar fatura. Verifique os dados e tente novamente.",
      );
      console.error("Erro ao criar fatura:", error);
    }
  }
  /* IGRP-CUSTOM-CODE-END */

  return (
    <IGRPContainer
      id="nova-fatura"
      name="nova-fatura"
      tag="nova-fatura"
      className="mx-auto max-w-5xl p-6 bg-[#f7f9fc] min-h-screen"
    >
      <IGRPButton name="force-studio" tag="force-studio" id="force-studio">FORCE</IGRPButton>
      <IGRPPageHeader
        name="nova-fatura-header"
        tag="nova-fatura-header"
        title="Nova Fatura de Venda"
        showBackButton
        urlBackButton="/faturas-venda"
        backButtonText="Faturas de Venda"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-6">
        {/* Informações Gerais */}
        <IGRPCard name="card-info-gerais" tag="card-info-gerais" className="rounded-2xl shadow-[0_2px_12px_rgba(53,121,246,0.07)] border border-slate-100">
          <IGRPCardContent className="p-6">
            <h2 className="mb-4 text-base font-semibold border-l-[3px] border-[#3579f6] pl-2">Informações Gerais</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Cliente */}
              <Controller
                name="clienteId"
                control={control}
                render={({ field }) => (
                  <IGRPSelect
                    name="clienteId"
                    tag="select-clienteId"
                    label="Cliente"
                    required
                    placeholder="Selecionar cliente…"
                    options={clientes.map((c) => ({
                      label: c.desig,
                      value: String(c.id),
                    }))}
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={(v) => field.onChange(Number(v))}
                    error={errors.clienteId?.message}
                  />
                )}
              />

              {/* Meio de Pagamento */}
              <Controller
                name="meioPagamento"
                control={control}
                render={({ field }) => (
                  <IGRPSelect
                    name="meioPagamento"
                    tag="select-meioPagamento"
                    label="Meio de Pagamento"
                    placeholder="Selecionar meio…"
                    options={MEIOS_PAGAMENTO.map((m) => ({
                      label: m.label,
                      value: m.value,
                    }))}
                    value={field.value ?? undefined}
                    onValueChange={(v) => field.onChange(v)}
                    error={errors.meioPagamento?.message}
                  />
                )}
              />

              {/* Tipo de Documento */}
              <Controller
                name="tipoFaturaId"
                control={control}
                render={({ field }) => (
                  <IGRPSelect
                    name="tipoFaturaId"
                    tag="select-tipoFaturaId"
                    label="Tipo de Documento"
                    required
                    placeholder={
                      tiposFaturaLoading ? "A carregar…" : "Selecionar tipo…"
                    }
                    disabled={tiposFaturaLoading}
                    options={tiposFatura.map((t) => ({
                      label: t.desig,
                      value: String(t.id),
                    }))}
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={(v) => field.onChange(Number(v))}
                    error={errors.tipoFaturaId?.message}
                  />
                )}
              />

              {/* Série */}
              <Controller
                name="prSerieId"
                control={control}
                render={({ field }) => (
                  <IGRPSelect
                    name="prSerieId"
                    tag="select-prSerieId"
                    label="Série"
                    required
                    placeholder={
                      seriesLoading ? "A carregar…" : "Selecionar série…"
                    }
                    disabled={seriesLoading}
                    options={series.map((s) => ({
                      label: `${s.codigo}${s.desig ? ` — ${s.desig}` : ""}`,
                      value: String(s.id),
                    }))}
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={(v) => field.onChange(Number(v))}
                    error={errors.prSerieId?.message}
                  />
                )}
              />

              {/* Data de Vencimento */}
              <IGRPInputText
                id="input-dataVencimento"
                tag="input-dataVencimento"
                label="Data de Vencimento"
                type="date"
                {...register("dataVencimento")}
              />

              {/* Observações */}
              <div className="col-span-full">
                <IGRPTextarea
                  id="textarea-observacoes"
                  tag="textarea-observacoes"
                  label="Observações"
                  placeholder="Observações adicionais…"
                  rows={2}
                  {...register("observacoes")}
                />
              </div>
            </div>
          </IGRPCardContent>
        </IGRPCard>

        {/* Itens da Fatura */}
        <IGRPCard name="card-itens-fatura" tag="card-itens-fatura" className="rounded-2xl shadow-[0_2px_12px_rgba(53,121,246,0.07)] border border-slate-100">
          <IGRPCardContent className="p-6">
            <h2 className="mb-4 text-base font-semibold border-l-[3px] border-[#3579f6] pl-2">
              Itens da Fatura
            </h2>

            {/* Product selector above the table */}
            <div className="mb-5 flex items-end gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <div className="flex-1">
                <IGRPSelect
                  name="add-produto"
                  tag="select-add-produto"
                  label="Selecionar Produto"
                  placeholder="Escolha um produto para adicionar…"
                  options={produtos.map((p) => ({
                    label: `${p.codigo ? `[${p.codigo}] ` : ""}${p.desig}`,
                    value: String(p.id),
                  }))}
                  value={addProdutoId}
                  onValueChange={setAddProdutoId}
                />
              </div>
              <div className="w-28">
                <IGRPInputNumber
                  name="add-qty"
                  label="Quantidade"
                  min={0.01}
                  step={1}
                  value={addQty}
                  onChange={(v) => setAddQty(Number(v) || 1)}
                />
              </div>
              <IGRPButton
                name="btn-add-produto"
                tag="btn-add-produto"
                type="button"
                onClick={handleAdicionarProduto}
                disabled={!addProdutoId}
              >
                + Adicionar
              </IGRPButton>
              <IGRPButton
                name="btn-add-linha-vazia"
                tag="btn-add-linha-vazia"
                type="button"
                variant="outline"
                onClick={() => append({ descricao: "", quantidade: 1, precoUnitario: 0, percentagemIva: 15, descontoPerc: 0, descontoValor: 0 })}
              >
                + Linha Vazia
              </IGRPButton>
            </div>

            {errors.itens && !Array.isArray(errors.itens) && (
              <p className="mb-3 text-sm text-destructive">
                {errors.itens.message}
              </p>
            )}

            <div className="overflow-x-auto">
              <IGRPTablePrimitive>
                <IGRPTableHeaderPrimitive>
                  <IGRPTableRowPrimitive>
                    <IGRPTableHeadPrimitive>
                      Produto / Serviço
                    </IGRPTableHeadPrimitive>
                    <IGRPTableHeadPrimitive className="w-24">
                      Qtd.
                    </IGRPTableHeadPrimitive>
                    <IGRPTableHeadPrimitive className="w-32">
                      Preço Unit. (c/ IVA)
                    </IGRPTableHeadPrimitive>
                    <IGRPTableHeadPrimitive className="w-24">
                      Desc. (%)
                    </IGRPTableHeadPrimitive>
                    <IGRPTableHeadPrimitive className="w-28">
                      Desc. (Valor)
                    </IGRPTableHeadPrimitive>
                    <IGRPTableHeadPrimitive className="w-24">
                      IVA %
                    </IGRPTableHeadPrimitive>
                    <IGRPTableHeadPrimitive className="w-36 text-right">
                      Total Linha
                    </IGRPTableHeadPrimitive>
                    <IGRPTableHeadPrimitive className="w-10" />
                  </IGRPTableRowPrimitive>
                </IGRPTableHeaderPrimitive>
                <IGRPTableBodyPrimitive>
                  {fields.length === 0 && (
                    <IGRPTableRowPrimitive>
                      <IGRPTableCellPrimitive colSpan={8} className="py-8 text-center text-sm text-gray-400">
                        Nenhum item adicionado. Use o seletor acima para adicionar produtos.
                      </IGRPTableCellPrimitive>
                    </IGRPTableRowPrimitive>
                  )}
                  {fields.map((field, i) => {
                    const item = watchedItens[i];
                    const { total: linhaTotal } = calcItem(
                      n(item?.quantidade),
                      n(item?.precoUnitario),
                      n(item?.percentagemIva),
                      n(item?.descontoPerc),
                    );
                    const itemErrors = errors.itens?.[i];
                    const baseTTC = round2(n(item?.quantidade) * n(item?.precoUnitario));

                    return (
                      <IGRPTableRowPrimitive key={field.id}>
                        {/* Descrição */}
                        <IGRPTableCellPrimitive className="align-top py-2 min-w-[200px]">
                          <IGRPInputText
                            placeholder="Designação / Serviço…"
                            error={itemErrors?.descricao?.message}
                            {...register(`itens.${i}.descricao`)}
                          />
                        </IGRPTableCellPrimitive>

                        {/* Quantidade */}
                        <IGRPTableCellPrimitive className="align-top py-2">
                          <Controller
                            name={`itens.${i}.quantidade`}
                            control={control}
                            render={({ field: f }) => (
                              <IGRPInputNumber
                                name={`itens.${i}.quantidade`}
                                min={0}
                                step={0.01}
                                value={f.value}
                                onChange={(v) => {
                                  f.onChange(v);
                                  const newBase = round2(n(v) * n(item?.precoUnitario));
                                  const perc = n(item?.descontoPerc);
                                  setValue(`itens.${i}.descontoValor`, round2(newBase * perc / 100));
                                }}
                                error={itemErrors?.quantidade?.message}
                              />
                            )}
                          />
                        </IGRPTableCellPrimitive>

                        {/* Preço Unitário */}
                        <IGRPTableCellPrimitive className="align-top py-2">
                          <Controller
                            name={`itens.${i}.precoUnitario`}
                            control={control}
                            render={({ field: f }) => (
                              <IGRPInputNumber
                                name={`itens.${i}.precoUnitario`}
                                min={0}
                                step={0.01}
                                value={f.value}
                                onChange={(v) => {
                                  f.onChange(v);
                                  const newBase = round2(n(item?.quantidade) * n(v));
                                  const perc = n(item?.descontoPerc);
                                  setValue(`itens.${i}.descontoValor`, round2(newBase * perc / 100));
                                }}
                                error={itemErrors?.precoUnitario?.message}
                              />
                            )}
                          />
                        </IGRPTableCellPrimitive>

                        {/* Desconto % */}
                        <IGRPTableCellPrimitive className="align-top py-2">
                          <Controller
                            name={`itens.${i}.descontoPerc`}
                            control={control}
                            render={({ field: f }) => (
                              <IGRPInputNumber
                                name={`itens.${i}.descontoPerc`}
                                min={0}
                                max={100}
                                step={0.01}
                                value={f.value}
                                onChange={(v) => {
                                  const perc = round2(Number(v) || 0);
                                  f.onChange(perc);
                                  setValue(`itens.${i}.descontoValor`, round2(baseTTC * perc / 100));
                                }}
                              />
                            )}
                          />
                        </IGRPTableCellPrimitive>

                        {/* Desconto Valor */}
                        <IGRPTableCellPrimitive className="align-top py-2">
                          <Controller
                            name={`itens.${i}.descontoValor`}
                            control={control}
                            render={({ field: f }) => (
                              <IGRPInputNumber
                                name={`itens.${i}.descontoValor`}
                                min={0}
                                step={0.01}
                                value={f.value}
                                onChange={(v) => {
                                  const val = round2(Number(v) || 0);
                                  f.onChange(val);
                                  setValue(
                                    `itens.${i}.descontoPerc`,
                                    baseTTC > 0 ? round2((val / baseTTC) * 100) : 0,
                                  );
                                }}
                              />
                            )}
                          />
                        </IGRPTableCellPrimitive>

                        {/* IVA % */}
                        <IGRPTableCellPrimitive className="align-top py-2">
                          <Controller
                            name={`itens.${i}.percentagemIva`}
                            control={control}
                            render={({ field: f }) => (
                              <IGRPInputNumber
                                name={`itens.${i}.percentagemIva`}
                                min={0}
                                max={100}
                                step={0.1}
                                value={f.value}
                                onChange={f.onChange}
                                error={itemErrors?.percentagemIva?.message}
                              />
                            )}
                          />
                        </IGRPTableCellPrimitive>

                        {/* Total Linha */}
                        <IGRPTableCellPrimitive className="text-right font-medium align-top py-4">
                          {formatCVE(linhaTotal)}
                        </IGRPTableCellPrimitive>

                        {/* Remover */}
                        <IGRPTableCellPrimitive className="align-top py-2">
                          <IGRPButton
                            name={`remover-linha-${i}`}
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(i)}
                          >
                            ×
                          </IGRPButton>
                        </IGRPTableCellPrimitive>
                      </IGRPTableRowPrimitive>
                    );
                  })}
                </IGRPTableBodyPrimitive>
              </IGRPTablePrimitive>
            </div>
          </IGRPCardContent>
        </IGRPCard>

        {/* Summary Strip + Ações */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4">
            <IGRPCard name="card-valor-iliquido" tag="card-valor-iliquido" className="rounded-2xl shadow-[0_2px_12px_rgba(53,121,246,0.07)] border border-slate-100">
              <IGRPCardContent className="p-5 text-center">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Valor Ilíquido</p>
                <p className="text-xl font-semibold text-gray-800">{formatCVE(valorIliquido)}</p>
              </IGRPCardContent>
            </IGRPCard>
            <IGRPCard name="card-valor-imposto" tag="card-valor-imposto" className="rounded-2xl shadow-[0_2px_12px_rgba(53,121,246,0.07)] border border-slate-100">
              <IGRPCardContent className="p-5 text-center">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">IVA</p>
                <p className="text-xl font-semibold text-gray-800">{formatCVE(valorImposto)}</p>
              </IGRPCardContent>
            </IGRPCard>
            <IGRPCard name="card-valor-total" tag="card-valor-total" className="rounded-2xl border border-[#3579f6] bg-[#3579f6]/5">
              <IGRPCardContent className="p-5 text-center">
                <p className="text-xs font-medium mb-1 uppercase tracking-wide text-[#3579f6]">Valor Total</p>
                <p className="text-2xl font-bold text-[#3579f6]">{formatCVEInt(valorTotalFinal)}</p>
              </IGRPCardContent>
            </IGRPCard>
          </div>
          <div className="flex justify-end gap-3">
            <IGRPButton
              name="cancelar"
              tag="btn-cancelar"
              type="button"
              variant="outline"
              onClick={() => router.push("/faturas-venda")}
            >
              Cancelar
            </IGRPButton>
            <IGRPButton
              name="confirmar-fatura"
              tag="btn-confirmar-fatura"
              type="submit"
              loading={isPending}
              loadingText="A guardar…"
            >
              Confirmar Fatura
            </IGRPButton>
          </div>
        </div>
      </form>
    </IGRPContainer>
  );
}
