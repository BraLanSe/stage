/* IGRP-GENERATED-PAGE */
"use client";

import {
  IGRPAlert,
  IGRPBadge,
  IGRPButton,
  IGRPContainer,
  IGRPInputNumber,
  IGRPInputText,
  IGRPModalDialog,
  IGRPModalDialogContent,
  IGRPModalDialogHeader,
  IGRPModalDialogTitle,
  IGRPPageHeader,
  IGRPSelect,
  IGRPTableBodyPrimitive,
  IGRPTableCellPrimitive,
  IGRPTableFooterPrimitive,
  IGRPTableHeadPrimitive,
  IGRPTableHeaderPrimitive,
  IGRPTablePrimitive,
  IGRPTableRowPrimitive,
  IGRPTextarea,
} from "@igrp/igrp-framework-react-design-system";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ItemFaturaVenda, Produto } from "@/app/(myapp)/types/efatura";
import { useClientes, useProdutos } from "@/hooks/use-cadastro";
import {
  useConfirmarFaturaVenda,
  useFaturaVenda,
} from "@/hooks/use-faturas-venda";
import { faturasVendaApi } from "@/lib/api/faturas-venda";

// ── Helpers ───────────────────────────────────────────────────

function fmt(v?: number) {
  if (v === undefined || v === null) return "—";
  return new Intl.NumberFormat("pt-CV", {
    style: "currency",
    currency: "CVE",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

// ── Product search modal ──────────────────────────────────────

function ProdutoSearch({
  open,
  onSelect,
  onClose,
}: {
  open: boolean;
  onSelect: (p: Produto) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const { data } = useProdutos(0, 20, q || undefined);
  const produtos = data?.content ?? [];

  return (
    <IGRPModalDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <IGRPModalDialogContent size="md">
        <IGRPModalDialogHeader>
          <IGRPModalDialogTitle name="search-produtos-title" tag="search-produtos-title">
            Pesquisar Produtos / Serviços
          </IGRPModalDialogTitle>
        </IGRPModalDialogHeader>
        <div className="p-4 space-y-3">
          <IGRPInputText
            name="search-produto"
            label="Pesquisar"
            placeholder="Pesquisar produtos ou serviços..."
            showIcon
            iconName="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="max-h-64 overflow-y-auto divide-y">
            {produtos.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhum produto encontrado
              </p>
            ) : (
              produtos.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onSelect(p);
                    onClose();
                  }}
                  className="flex w-full items-center justify-between px-3 py-2.5 hover:bg-muted text-left"
                >
                  <div>
                    <p className="text-sm font-medium">{p.desig}</p>
                    <p className="text-xs text-muted-foreground">{p.codigo}</p>
                  </div>
                  <span className="text-sm">{fmt(p.preco)}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </IGRPModalDialogContent>
    </IGRPModalDialog>
  );
}

// ── Line item row ─────────────────────────────────────────────

function LinhaProduto({
  item,
  index,
  onChange,
  onRemove,
}: {
  item: ItemFaturaVenda;
  index: number;
  onChange: (field: keyof ItemFaturaVenda, value: string | number) => void;
  onRemove: () => void;
}) {
  const total =
    (item.quantidade || 0) *
    (item.precoUnitario || 0) *
    (1 - (item.descontoComercialPerc || 0) / 100);

  return (
    <IGRPTableRowPrimitive>
      <IGRPTableCellPrimitive className="text-center text-xs text-muted-foreground">
        {index + 1}
      </IGRPTableCellPrimitive>
      <IGRPTableCellPrimitive>
        <IGRPInputText
          name={`item-${index}-desig`}
          value={item.desig ?? item.descricao ?? ""}
          onChange={(e) => onChange("desig", e.target.value)}
        />
      </IGRPTableCellPrimitive>
      <IGRPTableCellPrimitive>
        <IGRPInputNumber
          name={`item-${index}-quantidade`}
          value={item.quantidade}
          min={0}
          step={1}
          onChange={(v) => onChange("quantidade", v)}
        />
      </IGRPTableCellPrimitive>
      <IGRPTableCellPrimitive className="text-xs text-muted-foreground">
        {item.unidade ?? "Unid"}
      </IGRPTableCellPrimitive>
      <IGRPTableCellPrimitive>
        <IGRPInputNumber
          name={`item-${index}-preco`}
          value={item.precoUnitario}
          min={0}
          step={0.01}
          onChange={(v) => onChange("precoUnitario", v)}
        />
      </IGRPTableCellPrimitive>
      <IGRPTableCellPrimitive>
        <IGRPInputNumber
          name={`item-${index}-desconto`}
          value={item.descontoComercialPerc ?? 0}
          min={0}
          max={100}
          step={0.01}
          onChange={(v) => onChange("descontoComercialPerc", v)}
        />
      </IGRPTableCellPrimitive>
      <IGRPTableCellPrimitive>
        <IGRPInputText
          name={`item-${index}-descr`}
          value={item.descr ?? ""}
          onChange={(e) => onChange("descr", e.target.value)}
        />
      </IGRPTableCellPrimitive>
      <IGRPTableCellPrimitive className="text-center text-xs text-muted-foreground">
        {item.percentagemIva ? `IVA ${item.percentagemIva}%` : ""}
      </IGRPTableCellPrimitive>
      <IGRPTableCellPrimitive className="text-right text-xs font-medium">
        {fmt(total)}
      </IGRPTableCellPrimitive>
      <IGRPTableCellPrimitive className="text-center">
        <IGRPButton
          name={`remover-item-${index}`}
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
        >
          ×
        </IGRPButton>
      </IGRPTableCellPrimitive>
    </IGRPTableRowPrimitive>
  );
}

// ── Page ─────────────────────────────────────────────────────

const SERIE_OPTIONS = ["2022A", "2023A", "2024A", "2025A"].map((s) => ({
  label: s,
  value: s,
}));
const CONDICOES_OPTIONS = [
  "A pronto",
  "3 dias",
  "7 dias",
  "15 dias",
  "30 dias",
  "60 dias",
].map((c) => ({ label: c, value: c }));

export default function FaturaVendaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { data: fatura, isLoading, isError, error } = useFaturaVenda(id);
  const { mutateAsync: confirmar, isPending: isConfirming } =
    useConfirmarFaturaVenda();
  const { data: clientesPage } = useClientes();
  const clientes = clientesPage?.content ?? [];

  const [showProdutos, setShowProdutos] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState<
    number | undefined
  >();
  const [itens, setItens] = useState<ItemFaturaVenda[]>([]);
  const [serie, setSerie] = useState("2022A");
  const [data_, setData_] = useState("");
  const [condicoes, setCondicoes] = useState("3 dias");
  const [requisicao, setRequisicao] = useState("");
  const [descFinanceiro, setDescFinanceiro] = useState("0,0000");
  const [nota, setNota] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (fatura) {
      const raw = fatura as any;
      setItens(raw.items ?? fatura.itens ?? []);
      setSelectedClienteId(fatura.clienteId ?? raw.cliente?.id);
      setSerie(fatura.serie ?? raw.prSerie?.codigo ?? "2022A");
      setData_((fatura.dataEmissao ?? raw.dtFaturacao)?.split("T")[0] ?? "");
      setCondicoes(fatura.condicoesPagamento ?? raw.termCondicoes ?? "3 dias");
      setRequisicao(fatura.requisicao ?? "");
      setNota(fatura.nota ?? "");
    }
  }, [fatura]);

  function addProduto(p: Produto) {
    setItens((prev) => [
      ...prev,
      {
        desig: p.desig,
        descricao: p.desig,
        produtoId: p.id,
        codigoArtigo: p.codigo,
        quantidade: 1,
        precoUnitario: p.preco ?? 0,
        percentagemIva: p.percentagemIva ?? 15,
        unidade: p.unidade ?? "Unid",
      },
    ]);
  }

  function updateItem(
    index: number,
    field: keyof ItemFaturaVenda,
    value: string | number,
  ) {
    setItens((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function removeItem(index: number) {
    setItens((prev) => prev.filter((_, i) => i !== index));
  }

  const subtotal = itens.reduce(
    (acc, item) => acc + (item.quantidade || 0) * (item.precoUnitario || 0),
    0,
  );
  const totalDesconto = itens.reduce((acc, item) => {
    const base = (item.quantidade || 0) * (item.precoUnitario || 0);
    return acc + base * ((item.descontoComercialPerc || 0) / 100);
  }, 0);
  const totalIva = itens.reduce((acc, item) => {
    const base =
      (item.quantidade || 0) *
      (item.precoUnitario || 0) *
      (1 - (item.descontoComercialPerc || 0) / 100);
    return acc + base * ((item.percentagemIva || 0) / 100);
  }, 0);
  const total = subtotal - totalDesconto + totalIva;

  async function handleSave() {
    if (!selectedClienteId) return;
    setSaving(true);
    try {
      const raw = fatura as any;
      const tipoFaturaId = Number(raw.tipoFatura?.id);
      const prSerieId = Number(raw.prSerie?.id);
      const dtFaturacao =
        data_ || raw.dtFaturacao || new Date().toISOString().split("T")[0];

      const payload = {
        tipoFaturaId,
        dtFaturacao,
        clienteId: Number(selectedClienteId),
        prSerieId,
        termCondicoes: condicoes,
        nota,
        items: itens.map(
          (
            {
              desig,
              descricao,
              descr,
              quantidade,
              precoUnitario,
              descontoComercialPerc,
              descontoFinanceiroPerc,
              produtoId,
              codigoArtigo,
            },
            index,
          ) => ({
            numLinha: index + 1,
            desig: desig ?? descricao ?? "",
            ...(descr && { descr }),
            quantidade: Number(quantidade ?? 1),
            precoUnitario: Number(precoUnitario ?? 0),
            ...(descontoComercialPerc != null && {
              descontoComercialPerc: Number(descontoComercialPerc),
            }),
            ...(descontoFinanceiroPerc != null && {
              descontoFinanceiroPerc: Number(descontoFinanceiroPerc),
            }),
            ...(produtoId != null && { produtoId: Number(produtoId) }),
            ...(codigoArtigo && { codigoArtigo }),
          }),
        ),
      };

      await faturasVendaApi.atualizar(id, payload);
      toast.success("Fatura guardada com sucesso!");
    } catch (err) {
      const body = (err as { body?: { message?: string; error?: string } })?.body;
      const detail = body?.message ?? body?.error ?? String(err);
      console.error("[handleSave] PUT failed →", detail, err);
      toast.error(`Erro ao guardar: ${detail}`);
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl p-6 space-y-6 animate-pulse">
        <div className="h-7 w-40 rounded bg-gray-200" />
        <div className="space-y-3">
          <div className="h-3.5 w-24 rounded bg-gray-200" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-9 rounded bg-gray-200" />)}
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-3.5 w-24 rounded bg-gray-200" />
          <div className="h-9 rounded bg-gray-200" />
        </div>
        <div className="space-y-0 rounded border border-gray-100 overflow-hidden">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex gap-4 border-b border-gray-100 px-4 py-3 last:border-0">
              <div className="h-3.5 flex-1 rounded bg-gray-200" />
              <div className="h-3.5 w-12 rounded bg-gray-200" />
              <div className="h-3.5 w-20 rounded bg-gray-200" />
              <div className="h-3.5 w-16 rounded bg-gray-200" />
            </div>
          ))}
        </div>
        <div className="h-24 rounded bg-gray-200" />
      </div>
    );
  }

  if (isError || !fatura) {
    return (
      <div className="flex flex-col items-center gap-3 py-32">
        <p className="text-destructive text-sm">
          {(error as Error)?.message ?? "Fatura não encontrada"}
        </p>
        <IGRPButton name="voltar" variant="ghost" onClick={() => router.back()}>
          Voltar
        </IGRPButton>
      </div>
    );
  }

  const isConfirmed = fatura.estado === "CONFIRMADO";

  return (
    <IGRPContainer id="faturas-venda-detalhe" name="faturas-venda-detalhe" tag="faturas-venda-detalhe" className="min-h-screen bg-background">
      <IGRPButton name="force-studio" tag="force-studio" id="force-studio" className="sr-only">FORCE</IGRPButton>
      {showProdutos && (
        <ProdutoSearch
          open={showProdutos}
          onSelect={addProduto}
          onClose={() => setShowProdutos(false)}
        />
      )}

      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between pr-6">
          <IGRPPageHeader
            name="fatura-detail-header"
            title={`${isConfirmed ? "Ver" : "Editar"} #${fatura.numero ?? fatura.codigo ?? `FT${id}`}`}
            showBackButton
            urlBackButton="/faturas-venda"
            backButtonText="Faturas de Venda"
          />
          <IGRPBadge color={isConfirmed ? "success" : "secondary"}>
            {isConfirmed ? "Confirmado" : "Rascunho"}
          </IGRPBadge>
        </div>
        {isConfirmed && (
          <div className="mx-6 mb-2">
            <IGRPAlert variant="soft" color="warning">
              Esta fatura está confirmada e não pode ser editada.
            </IGRPAlert>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Dados de Venda */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Dados de Venda
            </h2>
            <div className="grid grid-cols-4 gap-3">
              <IGRPInputText
                name="numero-documento"
                label="Nº Documento"
                disabled
                value={fatura.numero ?? fatura.codigo ?? `FT${id}`}
              />
              <IGRPSelect
                name="serie"
                label="Série"
                required
                disabled={isConfirmed}
                options={SERIE_OPTIONS}
                value={serie}
                onValueChange={setSerie}
              />
              <IGRPInputText
                name="data-emissao"
                label="Data"
                required
                disabled={isConfirmed}
                placeholder="AAAA-MM-DD"
                value={data_}
                onChange={(e) => setData_(e.target.value)}
              />
              <IGRPSelect
                name="condicoes-pagamento"
                label="Condições pagamento"
                required
                disabled={isConfirmed}
                options={CONDICOES_OPTIONS}
                value={condicoes}
                onValueChange={setCondicoes}
              />
            </div>
          </section>

          {/* Dados do Cliente */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Dados do Cliente
            </h2>
            <IGRPSelect
              name="clienteId"
              label="Cliente"
              showSearch
              disabled={isConfirmed}
              placeholder="Selecionar cliente…"
              options={clientes.map((c) => ({
                label: `${c.desig}${c.nif ? ` — ${c.nif}` : ""}`,
                value: String(c.id),
              }))}
              value={selectedClienteId ? String(selectedClienteId) : undefined}
              onValueChange={(v) => setSelectedClienteId(Number(v))}
            />
          </section>

          {/* Product search button */}
          {!isConfirmed && (
            <IGRPButton
              name="pesquisar-produtos"
              type="button"
              variant="outline"
              showIcon
              iconName="Search"
              onClick={() => setShowProdutos(true)}
            >
              Pesquisar produtos ou serviços…
            </IGRPButton>
          )}

          {/* Produto / Serviço table */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Produto / Serviço
            </h2>
            <div className="overflow-x-auto rounded border">
              <IGRPTablePrimitive>
                <IGRPTableHeaderPrimitive>
                  <IGRPTableRowPrimitive>
                    <IGRPTableHeadPrimitive className="w-8 text-center">
                      #
                    </IGRPTableHeadPrimitive>
                    <IGRPTableHeadPrimitive>Desig.</IGRPTableHeadPrimitive>
                    <IGRPTableHeadPrimitive className="w-20">
                      Qtd.
                    </IGRPTableHeadPrimitive>
                    <IGRPTableHeadPrimitive className="w-14">
                      Unid
                    </IGRPTableHeadPrimitive>
                    <IGRPTableHeadPrimitive className="w-24">
                      Preço/Unid
                    </IGRPTableHeadPrimitive>
                    <IGRPTableHeadPrimitive className="w-20">
                      % Desc.
                    </IGRPTableHeadPrimitive>
                    <IGRPTableHeadPrimitive>Descrição</IGRPTableHeadPrimitive>
                    <IGRPTableHeadPrimitive className="w-20 text-center">
                      Imposto
                    </IGRPTableHeadPrimitive>
                    <IGRPTableHeadPrimitive className="w-24 text-right">
                      Total
                    </IGRPTableHeadPrimitive>
                    <IGRPTableHeadPrimitive className="w-10">
                      Ação
                    </IGRPTableHeadPrimitive>
                  </IGRPTableRowPrimitive>
                </IGRPTableHeaderPrimitive>
                <IGRPTableBodyPrimitive>
                  {itens.length === 0 ? (
                    <IGRPTableRowPrimitive>
                      <IGRPTableCellPrimitive
                        colSpan={10}
                        className="py-6 text-center text-muted-foreground"
                      >
                        Adicione produtos ou serviços
                      </IGRPTableCellPrimitive>
                    </IGRPTableRowPrimitive>
                  ) : (
                    itens.map((item, i) => (
                      <LinhaProduto
                        key={i}
                        item={item}
                        index={i}
                        onChange={(f, v) => updateItem(i, f, v)}
                        onRemove={() => removeItem(i)}
                      />
                    ))
                  )}
                </IGRPTableBodyPrimitive>
                <IGRPTableFooterPrimitive>
                  <IGRPTableRowPrimitive className="bg-primary text-primary-foreground font-semibold text-xs">
                    <IGRPTableCellPrimitive className="text-center">
                      #
                    </IGRPTableCellPrimitive>
                    <IGRPTableCellPrimitive colSpan={7}>
                      SubTotal:
                    </IGRPTableCellPrimitive>
                    <IGRPTableCellPrimitive className="text-right">
                      {fmt(totalDesconto)}
                    </IGRPTableCellPrimitive>
                    <IGRPTableCellPrimitive className="text-right">
                      {fmt(subtotal - totalDesconto)}
                    </IGRPTableCellPrimitive>
                  </IGRPTableRowPrimitive>
                  <IGRPTableRowPrimitive className="bg-primary/80 text-primary-foreground font-semibold text-xs">
                    <IGRPTableCellPrimitive className="text-center">
                      #
                    </IGRPTableCellPrimitive>
                    <IGRPTableCellPrimitive colSpan={8}>
                      Total a pagar:
                    </IGRPTableCellPrimitive>
                    <IGRPTableCellPrimitive className="text-right">
                      {fmt(total)}
                    </IGRPTableCellPrimitive>
                  </IGRPTableRowPrimitive>
                </IGRPTableFooterPrimitive>
              </IGRPTablePrimitive>
            </div>
          </section>

          {/* Requisição + Desc. Financeiro */}
          <div className="grid grid-cols-2 gap-6">
            <IGRPInputText
              name="requisicao"
              label="Requisição"
              disabled={isConfirmed}
              value={requisicao}
              onChange={(e) => setRequisicao(e.target.value)}
            />
            <IGRPInputText
              name="desc-financeiro"
              label="Desc. Financeiro (%)"
              required
              disabled={isConfirmed}
              value={descFinanceiro}
              onChange={(e) => setDescFinanceiro(e.target.value)}
            />
          </div>

          {/* Nota */}
          <IGRPTextarea
            name="nota"
            label="Nota"
            rows={3}
            disabled={isConfirmed}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
          />

          {/* Audit Trail */}
          {((fatura as any).createdBy || (fatura as any).createdDate) && (
            <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5 text-xs text-gray-500">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden="true">
                <circle cx="10" cy="10" r="8" />
                <path d="M10 6v4l2.5 2.5" />
              </svg>
              <span>
                Criado por{" "}
                <strong className="font-semibold text-gray-700">
                  {(fatura as any).createdBy ?? "—"}
                </strong>{" "}
                em{" "}
                <strong className="font-semibold text-gray-700">
                  {(fatura as any).createdDate
                    ? new Date((fatura as any).createdDate).toLocaleDateString("pt-PT", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </strong>
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <IGRPButton
              name="fechar"
              type="button"
              variant="outline"
              onClick={() => router.push("/faturas-venda")}
            >
              Fechar
            </IGRPButton>
            <div className="flex gap-2">
              <IGRPButton
                name="imprimir-pdf"
                tag="btn-imprimir-pdf"
                id="btn-imprimir-pdf"
                type="button"
                variant="outline"
                showIcon
                iconName="Printer"
                onClick={() => {
                  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8082/api/v1";
                  const pdfBase = apiUrl.replace(/\/api\/v1\/?$/, "/api/pdf-engine");
                  window.open(`${pdfBase}/fatura/${id}`, "_blank");
                }}
              >
                Exportar PDF
              </IGRPButton>
              {fatura.estado === "RASCUNHO" && (
                <IGRPButton
                  name="confirmar"
                  type="button"
                  loading={isConfirming}
                  loadingText="A confirmar…"
                  onClick={() => confirmar(id)}
                >
                  Confirmar
                </IGRPButton>
              )}
              {fatura.estado === "CONFIRMADO" && (
                <IGRPButton
                  name="emitir-dfe"
                  type="button"
                  onClick={() => router.push(`/faturas-venda/${id}/emitir-dfe`)}
                >
                  Emitir DFE
                </IGRPButton>
              )}
              {!isConfirmed && (
                <IGRPButton
                  name="guardar"
                  type="button"
                  showIcon
                  iconName="Save"
                  loading={saving}
                  loadingText="A guardar…"
                  onClick={handleSave}
                >
                  Guardar
                </IGRPButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </IGRPContainer>
  );
}
