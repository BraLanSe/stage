/* IGRP-GENERATED-PAGE */
"use client";

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
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4";
import type { TipoDocumento } from "@/app/(myapp)/types/efatura";
import { useFornecedores, useProdutos } from "@/hooks/use-cadastro";
import { useCriarFaturaCompra } from "@/hooks/use-faturas-compra";

const itemSchema = z.object({
  descricao: z.string().min(1, "Descrição obrigatória"),
  quantidade: z
    .number({ error: "Quantidade inválida" })
    .positive("Deve ser > 0"),
  precoUnitario: z.number({ error: "Preço inválido" }).positive("Deve ser > 0"),
  percentagemIva: z.number().min(0).max(100),
});

const schema = z.object({
  fornecedorId: z.number({ error: "Selecione um fornecedor" }),
  tipoDocumento: z.enum([
    "FATURA",
    "FATURA_RECIBO",
    "NOTA_CREDITO",
    "NOTA_DEBITO",
    "RECIBO",
  ] as const),
  serie: z.string().optional(),
  dataVencimento: z.string().optional(),
  observacoes: z.string().optional(),
  itens: z.array(itemSchema).min(1, "Adicione pelo menos um item"),
});

type FormValues = z.infer<typeof schema>;

const TIPOS_DOCUMENTO: { value: TipoDocumento; label: string }[] = [
  { value: "FATURA", label: "Fatura" },
  { value: "FATURA_RECIBO", label: "Fatura-Recibo" },
  { value: "NOTA_CREDITO", label: "Nota de Crédito" },
  { value: "NOTA_DEBITO", label: "Nota de Débito" },
  { value: "RECIBO", label: "Recibo" },
];

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

export default function NovaFaturaCompraPage() {
  const router = useRouter();
  const { mutateAsync: criar, isPending } = useCriarFaturaCompra();
  const { data: fornecedoresPage } = useFornecedores();
  const fornecedores = fornecedoresPage?.content ?? [];
  const { data: produtosPage } = useProdutos(0, 100);
  const produtos = produtosPage?.content ?? [];
  const [selectedProdutos, setSelectedProdutos] = useState<Record<string, string>>({});

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
      tipoDocumento: "FATURA",
      itens: [
        { descricao: "", quantidade: 1, precoUnitario: 0, percentagemIva: 15 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "itens" });
  const itens = watch("itens");

  const valorIliquido = round2(
    itens.reduce(
      (acc, item) => acc + round2(n(item?.quantidade) * n(item?.precoUnitario)),
      0,
    ),
  );
  const valorImposto = round2(
    itens.reduce((acc, item) => {
      const base = round2(n(item?.quantidade) * n(item?.precoUnitario));
      return acc + round2(base * (n(item?.percentagemIva) / 100));
    }, 0),
  );
  const valorTotal = round2(valorIliquido + valorImposto);

  async function onSubmit(values: FormValues) {
    try {
      const fatura = await criar(values);
      toast.success("Fatura de compra criada com sucesso!");
      router.push(`/faturas-compra/${fatura.id}`);
    } catch (err) {
      toast.error("Erro ao criar fatura. Verifique os dados e tente novamente.");
      console.error(err);
    }
  }

  return (
    <IGRPContainer id="nova-fatura-compra" name="nova-fatura-compra" tag="nova-fatura-compra" className="mx-auto max-w-5xl p-6 bg-[#f7f9fc] min-h-screen">
      <IGRPButton name="force-studio" tag="force-studio" id="force-studio" className="sr-only">FORCE</IGRPButton>
      <IGRPPageHeader
        name="nova-fatura-compra-header"
        tag="nova-fatura-compra-header"
        title="Nova Fatura de Compra"
        showBackButton
        urlBackButton="/faturas-compra"
        backButtonText="Faturas de Compra"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-6">
        {/* Informações Gerais */}
        <IGRPCard name="card-info-gerais" tag="card-info-gerais" className="rounded-2xl shadow-[0_2px_12px_rgba(53,121,246,0.07)] border border-slate-100">
          <IGRPCardContent className="p-6">
            <h2 className="mb-4 text-base font-semibold border-l-[3px] border-[#3579f6] pl-2">Informações Gerais</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Controller
                name="fornecedorId"
                control={control}
                render={({ field }) => (
                  <IGRPSelect
                    name="fornecedorId"
                    tag="select-fornecedorId"
                    label="Fornecedor"
                    required
                    placeholder="Selecionar fornecedor…"
                    options={fornecedores.map((f) => ({
                      label: f.desig,
                      value: String(f.id),
                    }))}
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={(v) => field.onChange(Number(v))}
                    error={errors.fornecedorId?.message}
                  />
                )}
              />

              <Controller
                name="tipoDocumento"
                control={control}
                render={({ field }) => (
                  <IGRPSelect
                    name="tipoDocumento"
                    tag="select-tipoDocumento"
                    label="Tipo de Documento"
                    required
                    options={TIPOS_DOCUMENTO.map((t) => ({
                      label: t.label,
                      value: t.value,
                    }))}
                    value={field.value}
                    onValueChange={(v) => field.onChange(v)}
                  />
                )}
              />

              <IGRPInputText
                tag="input-serie"
                label="Série"
                placeholder="Ex: FC-2025"
                {...register("serie")}
              />

              <IGRPInputText
                tag="input-dataVencimento"
                label="Data de Vencimento"
                type="date"
                {...register("dataVencimento")}
              />

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
                    <IGRPTableHeadPrimitive>Produto / Serviço</IGRPTableHeadPrimitive>
                    <IGRPTableHeadPrimitive className="w-28">Qtd.</IGRPTableHeadPrimitive>
                    <IGRPTableHeadPrimitive className="w-32">Preço Unit.</IGRPTableHeadPrimitive>
                    <IGRPTableHeadPrimitive className="w-24">IVA %</IGRPTableHeadPrimitive>
                    <IGRPTableHeadPrimitive className="w-36 text-right">Total Linha</IGRPTableHeadPrimitive>
                    <IGRPTableHeadPrimitive className="w-10" />
                  </IGRPTableRowPrimitive>
                </IGRPTableHeaderPrimitive>
                <IGRPTableBodyPrimitive>
                  {fields.map((field, i) => {
                    const item = itens[i];
                    const linhaTotal = item
                      ? calcLinha(
                          item.quantidade ?? 0,
                          item.precoUnitario ?? 0,
                          item.percentagemIva ?? 15,
                        )
                      : 0;
                    return (
                      <IGRPTableRowPrimitive key={field.id}>
                        <IGRPTableCellPrimitive className="align-top py-2 min-w-[220px]">
                          <div className="flex flex-col gap-1.5">
                            <IGRPSelect
                              name={`produto-select-${i}`}
                              tag={`select-produto-${i}`}
                              placeholder="Selecionar produto…"
                              value={selectedProdutos[field.id] ?? ""}
                              options={produtos.map((p) => ({
                                label: `${p.codigo ? `[${p.codigo}] ` : ""}${p.desig}`,
                                value: String(p.id),
                              }))}
                              onValueChange={(v) => {
                                setSelectedProdutos((prev) => ({ ...prev, [field.id]: v }));
                                const produto = produtos.find((p) => String(p.id) === v);
                                if (produto) {
                                  setValue(`itens.${i}.descricao`, produto.desig, { shouldValidate: true });
                                  setValue(`itens.${i}.precoUnitario`, produto.preco ?? 0, { shouldValidate: true });
                                }
                              }}
                            />
                            <IGRPInputText
                              placeholder="Ou descreva manualmente…"
                              error={errors.itens?.[i]?.descricao?.message}
                              {...register(`itens.${i}.descricao`)}
                            />
                          </div>
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
                                error={errors.itens?.[i]?.quantidade?.message}
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
                                error={errors.itens?.[i]?.precoUnitario?.message}
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
                                error={errors.itens?.[i]?.percentagemIva?.message}
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

        {/* Summary + Ações */}
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
              onClick={() => router.push("/faturas-compra")}
            >
              Cancelar
            </IGRPButton>
            <IGRPButton
              name="guardar-rascunho"
              tag="btn-guardar-rascunho"
              type="submit"
              showIcon
              iconName="Save"
              loading={isPending}
              loadingText="A guardar…"
            >
              Guardar Rascunho
            </IGRPButton>
          </div>
        </div>
      </form>
    </IGRPContainer>
  );
}
