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
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4";
import { useClientes } from "@/hooks/use-cadastro";
import { useCriarFaturaVenda } from "@/hooks/use-faturas-venda";
import { parametrizacaoApi } from "@/lib/api/parametrizacao";
/* IGRP-CUSTOM-CODE-END */

/* IGRP-CUSTOM-CODE-BEGIN(schema) */
const itemSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória"),
  quantidade: z
    .number({ error: "Quantidade inválida" })
    .positive("Deve ser > 0"),
  precoUnitario: z.number({ error: "Preço inválido" }).min(0, "Deve ser >= 0"),
  percentagemIva: z.number({ error: "IVA inválido" }).min(0).max(100),
});

const schema = z.object({
  clienteId: z.number({ error: "Selecione um cliente" }),
  tipoFaturaId: z.number({ error: "Selecione o tipo de documento" }),
  prSerieId: z.number({ error: "Selecione uma série" }),
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

function calcLinha(qty: number, unit: number, iva: number): number {
  const valorBruto = round2(n(qty) * n(unit));
  const valorImposto = round2(valorBruto * (n(iva) / 100));
  return round2(valorBruto + valorImposto);
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
/* IGRP-CUSTOM-CODE-END */

export default function NovaFaturaVendaPage() {
  /* IGRP-CUSTOM-CODE-BEGIN(hooks) */
  const router = useRouter();
  const { mutateAsync: criar, isPending } = useCriarFaturaVenda();
  const { data: clientesPage } = useClientes();
  const clientes = clientesPage?.content ?? [];

  const { data: tiposFaturaData, isLoading: tiposFaturaLoading } = useQuery({
    queryKey: ["parametrizacao", "tipos-fatura"],
    queryFn: () => parametrizacaoApi.tiposFatura.listar(),
  });
  const { data: seriesData, isLoading: seriesLoading } = useQuery({
    queryKey: ["parametrizacao", "series"],
    queryFn: () => parametrizacaoApi.series.listar(),
  });
  const tiposFatura = tiposFaturaData?.content ?? [];
  const series = seriesData?.content ?? [];

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      itens: [
        { descricao: "", quantidade: 1, precoUnitario: 0, percentagemIva: 15 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "itens" });
  const watchedItens = watch("itens") || [];

  const valorIliquido = round2(
    watchedItens.reduce(
      (acc, item) => acc + round2(n(item?.quantidade) * n(item?.precoUnitario)),
      0,
    ),
  );
  const valorImposto = round2(
    watchedItens.reduce((acc, item) => {
      const base = round2(n(item?.quantidade) * n(item?.precoUnitario));
      return acc + round2(base * (n(item?.percentagemIva) / 100));
    }, 0),
  );
  const valorTotal = round2(valorIliquido + valorImposto);

  async function onSubmit(values: FormValues) {
    try {
      const fatura = await criar({
        clienteId: values.clienteId,
        tipoFaturaId: values.tipoFaturaId,
        prSerieId: values.prSerieId,
        dataVencimento: values.dataVencimento,
        observacoes: values.observacoes,
        itens: values.itens.map(
          ({ descricao, quantidade, precoUnitario, percentagemIva }) => ({
            desig: descricao,
            quantidade,
            precoUnitario,
            percentagemIva,
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
      id="page-nova-fatura"
      className="mx-auto max-w-5xl p-6 bg-[#f7f9fc] min-h-screen"
    >
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
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(v) => field.onChange(Number(v))}
                    error={errors.clienteId?.message}
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
                    value={field.value ? String(field.value) : ""}
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
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(v) => field.onChange(Number(v))}
                    error={errors.prSerieId?.message}
                  />
                )}
              />

              {/* Data de Vencimento */}
              <IGRPInputText
                tag="input-dataVencimento"
                label="Data de Vencimento"
                placeholder="AAAA-MM-DD"
                {...register("dataVencimento")}
              />

              {/* Observações */}
              <div className="col-span-full">
                <IGRPTextarea
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
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold border-l-[3px] border-[#3579f6] pl-2">Itens da Fatura</h2>
              <IGRPButton
                name="adicionar-linha"
                tag="btn-adicionar-linha"
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    descricao: "",
                    quantidade: 1,
                    precoUnitario: 0,
                    percentagemIva: 15,
                  })
                }
              >
                + Adicionar Linha
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
                    <IGRPTableHeadPrimitive className="w-28">
                      Qtd.
                    </IGRPTableHeadPrimitive>
                    <IGRPTableHeadPrimitive className="w-32">
                      Preço Unit.
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
                  {fields.map((field, i) => {
                    const item = watchedItens[i];
                    const linhaTotal = item
                      ? calcLinha(
                          item.quantidade ?? 0,
                          item.precoUnitario ?? 0,
                          item.percentagemIva ?? 15,
                        )
                      : 0;
                    const itemErrors = errors.itens?.[i];

                    return (
                      <IGRPTableRowPrimitive key={field.id}>
                        <IGRPTableCellPrimitive className="align-top py-2">
                          <IGRPInputText
                            placeholder="Descrição do produto ou serviço"
                            error={itemErrors?.descricao?.message}
                            {...register(`itens.${i}.descricao`)}
                          />
                        </IGRPTableCellPrimitive>
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
                                onChange={f.onChange}
                                error={itemErrors?.quantidade?.message}
                              />
                            )}
                          />
                        </IGRPTableCellPrimitive>
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
                                onChange={f.onChange}
                                error={itemErrors?.precoUnitario?.message}
                              />
                            )}
                          />
                        </IGRPTableCellPrimitive>
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
                        <IGRPTableCellPrimitive className="text-right font-medium align-top py-4">
                          {formatCVE(linhaTotal)}
                        </IGRPTableCellPrimitive>
                        <IGRPTableCellPrimitive className="align-top py-2">
                          <IGRPButton
                            name={`remover-linha-${i}`}
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={fields.length === 1}
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
                <p className="text-2xl font-bold text-[#3579f6]">{formatCVE(valorTotal)}</p>
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
