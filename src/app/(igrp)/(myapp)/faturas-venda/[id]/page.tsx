"use client";

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
  onSelect,
  onClose,
}: {
  onSelect: (p: Produto) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const { data } = useProdutos(0, 20, q || undefined);
  const produtos = data?.content ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-32">
      <div className="w-full max-w-lg rounded-lg border border-gray-200 bg-white shadow-xl">
        <div className="flex items-center border-b border-gray-200 px-4 py-3">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-4 w-4 text-gray-400 mr-2"
          >
            <circle cx="8" cy="8" r="5" />
            <path d="M18 18l-4-4" />
          </svg>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pesquisar produtos ou serviços..."
            className="flex-1 text-sm focus:outline-none"
          />
          <button
            onClick={onClose}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {produtos.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-gray-400">
              Nenhum produto encontrado
            </p>
          ) : (
            produtos.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onSelect(p);
                  onClose();
                }}
                className="flex w-full items-center justify-between px-4 py-2.5 hover:bg-gray-50 text-left"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{p.desig}</p>
                  <p className="text-xs text-gray-400">{p.codigo}</p>
                </div>
                <span className="text-sm text-gray-600">{fmt(p.preco)}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
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
    <tr className="border-b border-gray-100 hover:bg-gray-50/50">
      <td className="px-2 py-1.5 text-center text-xs text-gray-400">
        {index + 1}
      </td>
      <td className="px-2 py-1.5">
        <input
          value={item.desig ?? item.descricao ?? ""}
          onChange={(e) => onChange("desig", e.target.value)}
          className="w-full min-w-[120px] rounded border-0 bg-transparent text-xs focus:outline-none focus:bg-gray-50 focus:ring-1 focus:ring-blue-300 px-1.5 py-0.5"
        />
      </td>
      <td className="px-2 py-1.5">
        <input
          type="number"
          value={item.quantidade}
          min={0}
          step="1"
          onChange={(e) => onChange("quantidade", parseFloat(e.target.value))}
          className="w-14 rounded border-0 bg-transparent text-right text-xs focus:outline-none focus:bg-gray-50 focus:ring-1 focus:ring-blue-300 px-1.5 py-0.5"
        />
      </td>
      <td className="px-2 py-1.5 text-xs text-gray-500">
        {item.unidade ?? "Unid"}
      </td>
      <td className="px-2 py-1.5">
        <input
          type="number"
          value={item.precoUnitario}
          min={0}
          step="0.01"
          onChange={(e) =>
            onChange("precoUnitario", parseFloat(e.target.value))
          }
          className="w-20 rounded border-0 bg-transparent text-right text-xs focus:outline-none focus:bg-gray-50 focus:ring-1 focus:ring-blue-300 px-1.5 py-0.5"
        />
      </td>
      <td className="px-2 py-1.5">
        <input
          type="number"
          value={item.descontoComercialPerc ?? 0}
          min={0}
          max={100}
          step="0.01"
          onChange={(e) =>
            onChange("descontoComercialPerc", parseFloat(e.target.value))
          }
          className="w-14 rounded border-0 bg-transparent text-right text-xs focus:outline-none focus:bg-gray-50 focus:ring-1 focus:ring-blue-300 px-1.5 py-0.5"
        />
      </td>
      <td className="px-2 py-1.5">
        <input
          value={item.descr ?? ""}
          onChange={(e) => onChange("descr", e.target.value)}
          className="w-full min-w-[80px] rounded border-0 bg-transparent text-xs focus:outline-none focus:bg-gray-50 focus:ring-1 focus:ring-blue-300 px-1.5 py-0.5"
        />
      </td>
      <td className="px-2 py-1.5 text-center text-xs text-gray-500">
        {item.percentagemIva ? `IVA ${item.percentagemIva}%` : ""}
      </td>
      <td className="px-2 py-1.5 text-right text-xs font-medium text-gray-800">
        {fmt(total)}
      </td>
      <td className="px-2 py-1.5 text-center">
        <button
          onClick={onRemove}
          className="text-gray-300 hover:text-red-500 transition-colors text-base leading-none"
        >
          ×
        </button>
      </td>
    </tr>
  );
}

// ── Page ─────────────────────────────────────────────────────

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
  const [clienteSearch, setClienteSearch] = useState("");
  const [showClienteDD, setShowClienteDD] = useState(false);
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
      setClienteSearch(fatura.clienteNome ?? "");
      setSerie(fatura.serie ?? "2022A");
      setData_(fatura.dataEmissao?.split("T")[0] ?? "");
      setCondicoes(fatura.condicoesPagamento ?? "3 dias");
      setRequisicao(fatura.requisicao ?? "");
      setNota(fatura.nota ?? "");
    }
  }, [fatura]);

  const clientesFiltrados = clientes.filter((c) =>
    c.desig.toLowerCase().includes(clienteSearch.toLowerCase()),
  );

  const clienteSelecionado = clientes.find((c) => c.id === selectedClienteId);

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
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
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
        tipoDocumento: fatura?.tipoDocumento ?? "FATURA",
        serie,
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
      <div className="flex items-center justify-center py-32 text-sm text-gray-400">
        A carregar fatura…
      </div>
    );
  }

  if (isError || !fatura) {
    return (
      <div className="flex flex-col items-center gap-3 py-32">
        <p className="text-red-500 text-sm">
          {(error as Error)?.message ?? "Fatura não encontrada"}
        </p>
        <button
          onClick={() => router.back()}
          className="text-xs text-blue-500 hover:underline"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showProdutos && (
        <ProdutoSearch
          onSelect={addProduto}
          onClose={() => setShowProdutos(false)}
        />
      )}

      <div className="mx-auto max-w-5xl bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h1 className="text-base font-semibold text-gray-800">
            Editar #{fatura.numero ?? fatura.codigo ?? `FT${id}`}
          </h1>
        </div>

        <div className="p-6 space-y-6">
          {/* Dados de Venda */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4 text-gray-400"
              >
                <path d="M3 4h14M3 8h14M3 12h14M3 16h8" />
              </svg>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Dados de Venda
              </h2>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Nº Documento</label>
                <input
                  disabled
                  value={fatura.numero ?? fatura.codigo ?? `FT${id}`}
                  className="h-8 rounded border border-gray-200 bg-gray-50 px-2.5 text-xs text-gray-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">
                  Série <span className="text-red-400">*</span>
                </label>
                <select
                  value={serie}
                  onChange={(e) => setSerie(e.target.value)}
                  className="h-8 rounded border border-gray-300 bg-white px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  <option>2022A</option>
                  <option>2023A</option>
                  <option>2024A</option>
                  <option>2025A</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">
                  Data <span className="text-red-400">*</span>
                </label>
                <div className="relative flex h-8 items-center rounded border border-gray-300 bg-white px-2">
                  <input
                    type="date"
                    value={data_}
                    onChange={(e) => setData_(e.target.value)}
                    className="flex-1 text-xs focus:outline-none"
                  />
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-3.5 w-3.5 text-gray-400 absolute right-2"
                  >
                    <rect x="3" y="4" width="14" height="13" rx="2" />
                    <path d="M7 2v3M13 2v3M3 9h14" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">
                  Condições pagamento <span className="text-red-400">*</span>
                </label>
                <select
                  value={condicoes}
                  onChange={(e) => setCondicoes(e.target.value)}
                  className="h-8 rounded border border-gray-300 bg-white px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  <option>A pronto</option>
                  <option>3 dias</option>
                  <option>7 dias</option>
                  <option>15 dias</option>
                  <option>30 dias</option>
                  <option>60 dias</option>
                </select>
              </div>
            </div>
          </section>

          {/* Dados do Cliente */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4 text-gray-400"
              >
                <circle cx="10" cy="7" r="4" />
                <path d="M2 17c0-3.3 2.7-6 6-6h4c3.3 0 6 2.7 6 6" />
              </svg>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Dados do Cliente
              </h2>
            </div>
            <div className="flex items-end gap-3">
              <div className="relative flex-1">
                <label className="mb-1 block text-xs text-gray-500">
                  Cliente
                </label>
                <div className="flex h-8 items-center rounded border border-gray-300 bg-white">
                  <input
                    value={
                      clienteSelecionado
                        ? `${clienteSelecionado.desig} - ${clienteSelecionado.nif ?? ""} -`
                        : clienteSearch
                    }
                    onChange={(e) => {
                      setClienteSearch(e.target.value);
                      setShowClienteDD(true);
                      setSelectedClienteId(undefined);
                    }}
                    onFocus={() => setShowClienteDD(true)}
                    className="flex-1 px-2.5 text-xs focus:outline-none bg-transparent"
                  />
                  {selectedClienteId && (
                    <button
                      onClick={() => {
                        setSelectedClienteId(undefined);
                        setClienteSearch("");
                      }}
                      className="px-2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                  <button className="px-2 text-gray-400">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-3 w-3"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                {showClienteDD && clientesFiltrados.length > 0 && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowClienteDD(false)}
                    />
                    <div className="absolute z-20 mt-1 w-full rounded border border-gray-200 bg-white shadow-md max-h-40 overflow-y-auto">
                      {clientesFiltrados.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setSelectedClienteId(c.id);
                            setClienteSearch(c.desig);
                            setShowClienteDD(false);
                          }}
                          className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs hover:bg-gray-50"
                        >
                          <span>{c.desig}</span>
                          <span className="text-gray-400">{c.nif}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <button className="flex h-8 items-center gap-1.5 rounded border border-blue-400 px-3 text-xs font-medium text-blue-600 hover:bg-blue-50 whitespace-nowrap">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-3.5 w-3.5"
                >
                  <line x1="10" y1="5" x2="10" y2="15" />
                  <line x1="5" y1="10" x2="15" y2="10" />
                </svg>
                Novo Cliente
              </button>
            </div>
          </section>

          {/* Product search bar */}
          <div className="flex h-9 items-center rounded border border-gray-300 bg-white px-3">
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-4 w-4 text-gray-400 mr-2"
            >
              <circle cx="8" cy="8" r="5" />
              <path d="M18 18l-4-4" />
            </svg>
            <button
              onClick={() => setShowProdutos(true)}
              className="flex-1 text-left text-xs text-gray-400"
            >
              Pesquisar produtos ou serviços…
            </button>
          </div>

          {/* Produto / Serviço table */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4 text-gray-400"
              >
                <path d="M4 6h12M4 10h12M4 14h6" />
              </svg>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Produto / Serviço
              </h2>
            </div>

            <div className="overflow-x-auto rounded border border-gray-200">
              <table className="w-full min-w-[700px] text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-8 px-2 py-2 text-center text-gray-500 font-medium">
                      #
                    </th>
                    <th className="px-2 py-2 text-left text-gray-500 font-medium">
                      Desig.
                    </th>
                    <th className="w-14 px-2 py-2 text-center text-gray-500 font-medium">
                      Qtd.
                    </th>
                    <th className="w-14 px-2 py-2 text-center text-gray-500 font-medium">
                      Unid
                    </th>
                    <th className="w-20 px-2 py-2 text-right text-gray-500 font-medium">
                      Preço/Unid
                    </th>
                    <th className="w-20 px-2 py-2 text-right text-gray-500 font-medium">
                      % Desc. Comercial
                    </th>
                    <th className="px-2 py-2 text-left text-gray-500 font-medium">
                      Descrição
                    </th>
                    <th className="w-20 px-2 py-2 text-center text-gray-500 font-medium">
                      Imposto
                    </th>
                    <th className="w-20 px-2 py-2 text-right text-gray-500 font-medium">
                      Total
                    </th>
                    <th className="w-8 px-2 py-2 text-gray-500 font-medium">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {itens.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="py-6 text-center text-gray-400"
                      >
                        Adicione produtos ou serviços
                      </td>
                    </tr>
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

                  {/* SubTotal row */}
                  <tr className="border-t border-gray-200 bg-blue-500 text-white text-xs font-semibold">
                    <td className="px-2 py-2 text-center">#</td>
                    <td colSpan={7} className="px-2 py-2">
                      SubTotal:
                    </td>
                    <td className="px-2 py-2 text-right">
                      {fmt(totalDesconto)}
                    </td>
                    <td className="px-2 py-2 text-right">
                      {fmt(subtotal - totalDesconto)}
                    </td>
                  </tr>

                  {/* Total row */}
                  <tr className="border-t border-gray-200 bg-blue-600 text-white text-xs font-semibold">
                    <td className="px-2 py-2 text-center">#</td>
                    <td colSpan={8} className="px-2 py-2">
                      Total a pagar:
                    </td>
                    <td className="px-2 py-2 text-right">{fmt(total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Requisição + Desc. Financeiro */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Requisição</label>
              <input
                value={requisicao}
                onChange={(e) => setRequisicao(e.target.value)}
                className="h-8 rounded border border-gray-300 bg-white px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col items-end gap-1">
              <label className="text-xs text-gray-500">
                Desc. Financeiro (%) <span className="text-red-400">*</span>
              </label>
              <input
                value={descFinanceiro}
                onChange={(e) => setDescFinanceiro(e.target.value)}
                className="h-8 w-40 rounded border border-gray-300 bg-white px-2.5 text-right text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Nota */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Nota</label>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={3}
              className="rounded border border-gray-300 bg-white px-2.5 py-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <button
              onClick={() => router.push("/faturas-venda")}
              className="rounded border border-gray-300 px-5 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
            >
              Fechar
            </button>
            <div className="flex gap-2">
              {fatura.estado === "RASCUNHO" && (
                <button
                  onClick={() => confirmar(id)}
                  disabled={isConfirming}
                  className="rounded bg-green-600 px-5 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-60"
                >
                  {isConfirming ? "A confirmar…" : "Confirmar"}
                </button>
              )}
              {fatura.estado === "CONFIRMADO" && (
                <Link
                  href={`/faturas-venda/${id}/emitir-dfe`}
                  className="rounded bg-indigo-600 px-5 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                >
                  Emitir DFE
                </Link>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded bg-blue-600 px-5 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "A guardar…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
