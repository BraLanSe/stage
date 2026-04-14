"use client";

import {
  IGRPButton,
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
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ItemFaturaVenda, Produto } from "@/app/(myapp)/types/efatura";
import { useClientes, useProdutos } from "@/hooks/use-cadastro";
import {
  useConfirmarFaturaVenda,
  useFaturaVenda,
} from "@/hooks/use-faturas-venda";
import { faturasVendaApi } from "@/lib/api/faturas-venda";

// ── Helpers ───────────────────────────────────────────────────

function fmt(v?: number) {
  if (v === undefined || v === null) return "0";
  return new Intl.NumberFormat("pt-CV", {
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
          <IGRPModalDialogTitle name="search-produtos-title">
            Pesquisar Produtos / Serviços
          </IGRPModalDialogTitle>
        </IGRPModalDialogHeader>
        <div className="p-4 space-y-3">
          <IGRPInputText
            name="search-produto"
            label="Pesquisar"
            placeholder="Pesquisar produtos ou serviços..."
            showIcon
            iconName="search"
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
      setItens(fatura.itens ?? []);
      setSelectedClienteId(fatura.clienteId);
      setSerie(fatura.serie ?? "2022A");
      setData_(fatura.dataEmissao?.split("T")[0] ?? "");
      setCondicoes(fatura.condicoesPagamento ?? "3 dias");
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
      await faturasVendaApi.atualizar(id, {
        clienteId: selectedClienteId,
        condicoesPagamento: condicoes,
        observacoes: nota,
        itens: itens.map(
          ({
            desig,
            descricao,
            quantidade,
            precoUnitario,
            descontoComercialPerc,
            percentagemIva,
            unidade,
            produtoId,
            codigoArtigo,
          }) => ({
            desig: desig ?? descricao ?? "",
            descricao: descricao ?? desig ?? "",
            quantidade: quantidade ?? 1,
            precoUnitario: precoUnitario ?? 0,
            descontoComercialPerc,
            percentagemIva: percentagemIva ?? 0,
            unidade,
            produtoId,
            codigoArtigo,
          }),
        ),
      });
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 text-sm text-muted-foreground">
        A carregar fatura…
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

  return (
    <div className="min-h-screen bg-background">
      <ProdutoSearch
        open={showProdutos}
        onSelect={addProduto}
        onClose={() => setShowProdutos(false)}
      />

      <div className="mx-auto max-w-5xl">
        <IGRPPageHeader
          name="fatura-detail-header"
          title={`Editar #${fatura.numero ?? fatura.codigo ?? `FT${id}`}`}
          showBackButton
          urlBackButton="/faturas-venda"
          backButtonText="Faturas de Venda"
        />

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
                options={SERIE_OPTIONS}
                value={serie}
                onValueChange={setSerie}
              />
              <IGRPInputText
                name="data-emissao"
                label="Data"
                required
                placeholder="AAAA-MM-DD"
                value={data_}
                onChange={(e) => setData_(e.target.value)}
              />
              <IGRPSelect
                name="condicoes-pagamento"
                label="Condições pagamento"
                required
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
              placeholder="Selecionar cliente…"
              options={clientes.map((c) => ({
                label: `${c.desig}${c.nif ? ` — ${c.nif}` : ""}`,
                value: String(c.id),
              }))}
              value={selectedClienteId ? String(selectedClienteId) : ""}
              onValueChange={(v) => setSelectedClienteId(Number(v))}
            />
          </section>

          {/* Product search button */}
          <IGRPButton
            name="pesquisar-produtos"
            type="button"
            variant="outline"
            showIcon
            iconName="search"
            onClick={() => setShowProdutos(true)}
          >
            Pesquisar produtos ou serviços…
          </IGRPButton>

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
              value={requisicao}
              onChange={(e) => setRequisicao(e.target.value)}
            />
            <IGRPInputText
              name="desc-financeiro"
              label="Desc. Financeiro (%)"
              required
              value={descFinanceiro}
              onChange={(e) => setDescFinanceiro(e.target.value)}
            />
          </div>

          {/* Nota */}
          <IGRPTextarea
            name="nota"
            label="Nota"
            rows={3}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
          />

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
                <IGRPButton name="emitir-dfe" type="button" asChild>
                  <Link href={`/faturas-venda/${id}/emitir-dfe`}>
                    Emitir DFE
                  </Link>
                </IGRPButton>
              )}
              <IGRPButton
                name="guardar"
                type="button"
                loading={saving}
                loadingText="A guardar…"
                onClick={handleSave}
              >
                Guardar
              </IGRPButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
