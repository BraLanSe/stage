"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4";
import { useClientes } from "@/hooks/use-cadastro";
import { useCriarFaturaVenda } from "@/hooks/use-faturas-venda";
import { parametrizacaoApi } from "@/lib/api/parametrizacao";

// ── Schema ───────────────────────────────────────────────────

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
  /** ID from GET /parametrizacao/tipos-fatura */
  tipoFaturaId: z.number({ error: "Selecione o tipo de documento" }),
  /** ID from GET /parametrizacao/series */
  prSerieId: z.number({ error: "Selecione uma série" }),
  dataVencimento: z.string().optional(),
  observacoes: z.string().optional(),
  itens: z.array(itemSchema).min(1, "Adicione pelo menos um item"),
});

type FormValues = z.infer<typeof schema>;

// ── Monetary helpers ─────────────────────────────────────────

/** Round to 2 decimal places — mirrors Java BigDecimal(scale=2) on the server */
function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

/** NaN-safe coerce: undefined / null / NaN → 0 */
function n(v: number | undefined | null): number {
  const x = Number(v);
  return Number.isNaN(x) ? 0 : x;
}

/**
 * Per-line total with step-by-step rounding.
 * Each intermediate value is rounded before the next operation
 * to stay in sync with the server-side BigDecimal calculation.
 *
 * Formula: valorBruto = qty × price
 *          valorImposto = round2(valorBruto × iva%)
 *          totalLinha   = valorBruto + valorImposto
 */
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

// ── Page ─────────────────────────────────────────────────────

export default function NovaFaturaVendaPage() {
  const router = useRouter();
  const { mutateAsync: criar, isPending } = useCriarFaturaVenda();
  const { data: clientesPage } = useClientes();
  const clientes = clientesPage?.content ?? [];

  const {
    data: tiposFaturaData,
    error: tiposFaturaError,
    isLoading: tiposFaturaLoading,
  } = useQuery({
    queryKey: ["parametrizacao", "tipos-fatura"],
    queryFn: () => parametrizacaoApi.tiposFatura.listar(),
  });
  const {
    data: seriesData,
    error: seriesError,
    isLoading: seriesLoading,
  } = useQuery({
    queryKey: ["parametrizacao", "series"],
    queryFn: () => parametrizacaoApi.series.listar(),
  });
  const tiposFatura = tiposFaturaData?.content ?? [];
  const series = seriesData?.content ?? [];

  // ── Debug logs — remove once parametrização is confirmed working ──
  if (tiposFaturaError) console.error("[nova-fatura] tiposFatura error:", tiposFaturaError);
  if (seriesError) console.error("[nova-fatura] series error:", seriesError);
  if (!tiposFaturaLoading && tiposFatura.length === 0) console.warn("[nova-fatura] tiposFatura vazio — vérifier seed backend (DataInitializer)");
  if (!seriesLoading && series.length === 0) console.warn("[nova-fatura] series vazio — vérifier seed backend (DataInitializer)");

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

  return (
    <div className="mx-auto max-w-5xl p-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <a
          href="/faturas-venda"
          className="hover:text-foreground hover:underline"
        >
          Faturas de Venda
        </a>
        <span>/</span>
        <span className="text-foreground font-medium">Nova Fatura</span>
      </nav>

      <h1 className="mb-8 text-2xl font-bold text-foreground">
        Nova Fatura de Venda
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* Header fields */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-foreground">
            Informações Gerais
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Cliente */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="clienteId" className="text-sm font-medium text-foreground">
                Cliente <span className="text-destructive">*</span>
              </label>
              <select
                id="clienteId"
                className={`h-10 rounded-full border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.clienteId ? "border-destructive" : "border-input"}`}
                {...register("clienteId", { valueAsNumber: true })}
              >
                <option value="">Selecionar cliente…</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.desig}
                  </option>
                ))}
              </select>
              {errors.clienteId && (
                <p className="text-xs text-destructive">
                  {errors.clienteId.message}
                </p>
              )}
            </div>

            {/* Tipo de Documento — loaded from /parametrizacao/tipos-fatura */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="tipoFaturaId" className="text-sm font-medium text-foreground">
                Tipo de Documento <span className="text-destructive">*</span>
              </label>
              <select
                id="tipoFaturaId"
                disabled={tiposFaturaLoading}
                className={`h-10 rounded-full border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.tipoFaturaId ? "border-destructive" : "border-input"}`}
                {...register("tipoFaturaId", { valueAsNumber: true })}
              >
                <option value="">
                  {tiposFaturaLoading ? "A carregar…" : tiposFatura.length === 0 ? "⚠ Sem dados — configure o backend" : "Selecionar tipo…"}
                </option>
                {tiposFatura.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.desig}
                  </option>
                ))}
              </select>
              {errors.tipoFaturaId && (
                <p className="text-xs text-destructive">{errors.tipoFaturaId.message}</p>
              )}
              {!tiposFaturaLoading && tiposFatura.length === 0 && (
                <p className="text-xs text-amber-600">Aucune donnée trouvée — veuillez configurer les paramètres via POST /parametrizacao/tipos-fatura</p>
              )}
            </div>

            {/* Série — loaded from /parametrizacao/series */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="prSerieId" className="text-sm font-medium text-foreground">
                Série <span className="text-destructive">*</span>
              </label>
              <select
                id="prSerieId"
                disabled={seriesLoading}
                className={`h-10 rounded-full border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.prSerieId ? "border-destructive" : "border-input"}`}
                {...register("prSerieId", { valueAsNumber: true })}
              >
                <option value="">
                  {seriesLoading ? "A carregar…" : series.length === 0 ? "⚠ Sem dados — configure o backend" : "Selecionar série…"}
                </option>
                {series.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.codigo}{s.desig ? ` — ${s.desig}` : ""}
                  </option>
                ))}
              </select>
              {errors.prSerieId && (
                <p className="text-xs text-destructive">{errors.prSerieId.message}</p>
              )}
              {!seriesLoading && series.length === 0 && (
                <p className="text-xs text-amber-600">Aucune donnée trouvée — veuillez configurer les paramètres via POST /parametrizacao/series</p>
              )}
            </div>

            {/* Data de Vencimento */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="dataVencimento" className="text-sm font-medium text-foreground">
                Data de Vencimento
              </label>
              <input
                id="dataVencimento"
                type="date"
                className="h-10 rounded-full border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                {...register("dataVencimento")}
              />
            </div>

            {/* Observações */}
            <div className="col-span-full flex flex-col gap-1.5">
              <label htmlFor="observacoes" className="text-sm font-medium text-foreground">
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

        {/* Items */}
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
                    <tr key={field.id}>
                      <td className="py-2 pr-3 align-top">
                        <input
                          placeholder="Descrição do produto ou serviço"
                          className={`w-full rounded border bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 ${itemErrors?.descricao ? "border-destructive" : "border-input"}`}
                          {...register(`itens.${i}.descricao`)}
                        />
                        {itemErrors?.descricao && (
                          <p className="mt-1 text-xs text-destructive">
                            {itemErrors.descricao.message}
                          </p>
                        )}
                      </td>
                      <td className="py-2 px-1 align-top">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          className={`w-full rounded border bg-background px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary/40 ${itemErrors?.quantidade ? "border-destructive" : "border-input"}`}
                          {...register(`itens.${i}.quantidade`, {
                            valueAsNumber: true,
                          })}
                        />
                      </td>
                      <td className="py-2 px-1 align-top">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          className={`w-full rounded border bg-background px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary/40 ${itemErrors?.precoUnitario ? "border-destructive" : "border-input"}`}
                          {...register(`itens.${i}.precoUnitario`, {
                            valueAsNumber: true,
                          })}
                        />
                      </td>
                      <td className="py-2 px-1 align-top">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step="0.1"
                          className={`w-full rounded border bg-background px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary/40 ${itemErrors?.percentagemIva ? "border-destructive" : "border-input"}`}
                          {...register(`itens.${i}.percentagemIva`, {
                            valueAsNumber: true,
                          })}
                        />
                      </td>
                      <td className="py-2 pl-3 text-right font-medium align-top pt-3">
                        {formatCVE(linhaTotal)}
                      </td>
                      <td className="py-2 pl-2 align-top pt-3">
                        <button
                          type="button"
                          onClick={() => remove(i)}
                          disabled={fields.length === 1}
                          className="text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors"
                          aria-label="Remover linha"
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

        {/* Summary + Actions */}
        <div className="flex items-end justify-between gap-6">
          {/* Financial summary */}
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

          {/* Actions */}
          <div className="flex items-center gap-3">
            <a
              href="/faturas-venda"
              className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-5 text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancelar
            </a>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {isPending ? "A guardar…" : "Confirmar Fatura"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
