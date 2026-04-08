"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod/v4";
import type { TipoDocumento } from "@/app/(myapp)/types/efatura";
import { useFornecedores } from "@/hooks/use-cadastro";
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

  const {
    register,
    control,
    handleSubmit,
    watch,
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
    const fatura = await criar(values);
    router.push(`/faturas-compra/${fatura.id}`);
  }

  return (
    <div className="mx-auto max-w-5xl p-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <a
          href="/faturas-compra"
          className="hover:text-foreground hover:underline"
        >
          Faturas de Compra
        </a>
        <span>/</span>
        <span className="text-foreground font-medium">Nova Fatura</span>
      </nav>

      <h1 className="mb-8 text-2xl font-bold text-foreground">
        Nova Fatura de Compra
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-foreground">
            Informações Gerais
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="fornecedorId"
                className="text-sm font-medium text-foreground"
              >
                Fornecedor <span className="text-destructive">*</span>
              </label>
              <select
                id="fornecedorId"
                className="h-10 rounded-full border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                {...register("fornecedorId", { valueAsNumber: true })}
              >
                <option value="">Selecionar fornecedor…</option>
                {fornecedores.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))}
              </select>
              {errors.fornecedorId && (
                <p className="text-xs text-destructive">
                  {errors.fornecedorId.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="tipoDocumento"
                className="text-sm font-medium text-foreground"
              >
                Tipo de Documento <span className="text-destructive">*</span>
              </label>
              <select
                id="tipoDocumento"
                className="h-10 rounded-full border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                {...register("tipoDocumento")}
              >
                {TIPOS_DOCUMENTO.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="serie"
                className="text-sm font-medium text-foreground"
              >
                Série
              </label>
              <input
                id="serie"
                placeholder="Ex: FC-2025"
                className="h-10 rounded-full border border-input bg-background px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                {...register("serie")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="dataVencimento"
                className="text-sm font-medium text-foreground"
              >
                Data de Vencimento
              </label>
              <input
                id="dataVencimento"
                type="date"
                className="h-10 rounded-full border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                {...register("dataVencimento")}
              />
            </div>

            <div className="col-span-full flex flex-col gap-1.5">
              <label
                htmlFor="observacoes"
                className="text-sm font-medium text-foreground"
              >
                Observações
              </label>
              <textarea
                id="observacoes"
                rows={2}
                placeholder="Observações adicionais…"
                className="rounded-lg border border-input bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                {...register("observacoes")}
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Itens da Fatura
            </h2>
            <button
              type="button"
              onClick={() =>
                append({
                  descricao: "",
                  quantidade: 1,
                  precoUnitario: 0,
                  percentagemIva: 15,
                })
              }
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-sm font-medium hover:bg-muted transition-colors"
            >
              + Adicionar Linha
            </button>
          </div>

          {errors.itens && !Array.isArray(errors.itens) && (
            <p className="mb-3 text-sm text-destructive">
              {errors.itens.message}
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left font-medium text-muted-foreground">
                    Produto / Serviço
                  </th>
                  <th className="pb-2 w-24 text-right font-medium text-muted-foreground">
                    Qtd.
                  </th>
                  <th className="pb-2 w-32 text-right font-medium text-muted-foreground">
                    Preço Unit.
                  </th>
                  <th className="pb-2 w-24 text-right font-medium text-muted-foreground">
                    IVA %
                  </th>
                  <th className="pb-2 w-36 text-right font-medium text-muted-foreground">
                    Total Linha
                  </th>
                  <th className="pb-2 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
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
                    <tr key={field.id}>
                      <td className="py-2 pr-3">
                        <input
                          placeholder="Descrição do produto ou serviço"
                          className="w-full rounded border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                          {...register(`itens.${i}.descricao`)}
                        />
                      </td>
                      <td className="py-2 px-1">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm text-right focus:outline-none"
                          {...register(`itens.${i}.quantidade`, {
                            valueAsNumber: true,
                          })}
                        />
                      </td>
                      <td className="py-2 px-1">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm text-right focus:outline-none"
                          {...register(`itens.${i}.precoUnitario`, {
                            valueAsNumber: true,
                          })}
                        />
                      </td>
                      <td className="py-2 px-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step="0.1"
                          className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm text-right focus:outline-none"
                          {...register(`itens.${i}.percentagemIva`, {
                            valueAsNumber: true,
                          })}
                        />
                      </td>
                      <td className="py-2 pl-3 text-right font-medium">
                        {formatCVE(linhaTotal)}
                      </td>
                      <td className="py-2 pl-2">
                        <button
                          type="button"
                          onClick={() => remove(i)}
                          disabled={fields.length === 1}
                          className="text-muted-foreground hover:text-destructive disabled:opacity-30"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-end justify-between gap-6">
          <div className="rounded-lg border border-border bg-card p-5 w-80 shadow-sm">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Valor Ilíquido</span>
              <span>{formatCVE(valorIliquido)}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-muted-foreground">Valor Imposto (IVA)</span>
              <span>{formatCVE(valorImposto)}</span>
            </div>
            <hr className="my-3 border-border" />
            <div className="flex justify-between font-bold">
              <span>Valor Total</span>
              <span className="text-lg">{formatCVE(valorTotal)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/faturas-compra"
              className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-5 text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancelar
            </a>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {isPending ? "A guardar…" : "Guardar Rascunho"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
