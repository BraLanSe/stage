"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useRouter } from "next/navigation";
import { useCriarFaturaVenda } from "@/hooks/use-faturas-venda";
import { useClientes } from "@/hooks/use-cadastro";
import type { TipoDocumento } from "@/app/(myapp)/types/efatura";

// ── Schema ───────────────────────────────────────────────────

const itemSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória"),
  quantidade: z.number({ error: "Quantidade inválida" }).positive("Deve ser > 0"),
  precoUnitario: z.number({ error: "Preço inválido" }).positive("Deve ser > 0"),
  percentagemIva: z.number().min(0).max(100),
});

const schema = z.object({
  clienteId: z.number({ error: "Selecione um cliente" }),
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

// ── Helpers ──────────────────────────────────────────────────

function calcLinha(qty: number, unit: number, iva: number) {
  const base = qty * unit;
  return base + base * (iva / 100);
}

function formatCVE(v: number) {
  return new Intl.NumberFormat("pt-CV", {
    style: "currency",
    currency: "CVE",
    minimumFractionDigits: 0,
  }).format(v);
}

// ── Page ─────────────────────────────────────────────────────

export default function NovaFaturaVendaPage() {
  const router = useRouter();
  const { mutateAsync: criar, isPending } = useCriarFaturaVenda();
  const { data: clientesPage } = useClientes();
  const clientes = clientesPage?.content ?? [];

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
      percentagemIva: 15,
      itens: [{ descricao: "", quantidade: 1, precoUnitario: 0, percentagemIva: 15 }],
    } as Partial<FormValues>,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "itens" });
  const itens = watch("itens");

  const subtotal = itens.reduce(
    (acc, item) => acc + (item.quantidade ?? 0) * (item.precoUnitario ?? 0),
    0,
  );
  const totalIva = itens.reduce(
    (acc, item) =>
      acc +
      (item.quantidade ?? 0) *
        (item.precoUnitario ?? 0) *
        ((item.percentagemIva ?? 15) / 100),
    0,
  );
  const total = subtotal + totalIva;

  async function onSubmit(values: FormValues) {
    const fatura = await criar({
      ...values,
      itens: values.itens.map(({ descricao, quantidade, precoUnitario, percentagemIva }) => ({
        desig: descricao,
        descricao,
        quantidade,
        precoUnitario,
        percentagemIva,
      })),
    });
    router.push(`/faturas-venda/${fatura.id}`);
  }

  return (
    <div className="mx-auto max-w-5xl p-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <a href="/faturas-venda" className="hover:text-foreground hover:underline">
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
              <label className="text-sm font-medium text-foreground">
                Cliente <span className="text-destructive">*</span>
              </label>
              <select
                className="h-10 rounded-full border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                {...register("clienteId", { valueAsNumber: true })}
              >
                <option value="">Selecionar cliente…</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
              {errors.clienteId && (
                <p className="text-xs text-destructive">{errors.clienteId.message}</p>
              )}
            </div>

            {/* Tipo de Documento */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Tipo de Documento <span className="text-destructive">*</span>
              </label>
              <select
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

            {/* Série */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Série</label>
              <input
                placeholder="Ex: FT-2025"
                className="h-10 rounded-full border border-input bg-background px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                {...register("serie")}
              />
            </div>

            {/* Data de Vencimento */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Data de Vencimento
              </label>
              <input
                type="date"
                className="h-10 rounded-full border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                {...register("dataVencimento")}
              />
            </div>

            {/* Observações */}
            <div className="col-span-full flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Observações
              </label>
              <textarea
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
                append({ descricao: "", quantidade: 1, precoUnitario: 0, percentagemIva: 15 })
              }
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-sm font-medium hover:bg-muted transition-colors"
            >
              + Adicionar Linha
            </button>
          </div>

          {errors.itens && !Array.isArray(errors.itens) && (
            <p className="mb-3 text-sm text-destructive">{errors.itens.message}</p>
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
                          className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary/40"
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
                          className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary/40"
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
                          className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary/40"
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
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCVE(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-muted-foreground">IVA (auto 15%)</span>
              <span>{formatCVE(totalIva)}</span>
            </div>
            <hr className="my-3 border-border" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span className="text-lg">{formatCVE(total)}</span>
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
              {isPending ? "A guardar…" : "Guardar Rascunho"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
