"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ItemFaturaCompra } from "@/app/(myapp)/types/efatura";
import { useFornecedores } from "@/hooks/use-cadastro";
import {
  useAtualizarFaturaCompra,
  useConfirmarFaturaCompra,
  useFaturaCompra,
} from "@/hooks/use-faturas-compra";

function fmt(v?: number) {
  if (v === undefined || v === null) return "0";
  return new Intl.NumberFormat("pt-CV", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

function LinhaItem({
  item,
  index,
  onChange,
  onRemove,
}: {
  item: ItemFaturaCompra;
  index: number;
  onChange: (field: keyof ItemFaturaCompra, value: string | number) => void;
  onRemove: () => void;
}) {
  const total =
    (item.quantidade || 0) *
    (item.precoUnitario || 0) *
    (1 + (item.percentagemIva || 0) / 100);

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50">
      <td className="px-2 py-1.5 text-center text-xs text-gray-400">
        {index + 1}
      </td>
      <td className="px-2 py-1.5">
        <input
          value={item.descricao ?? ""}
          onChange={(e) => onChange("descricao", e.target.value)}
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
          value={item.percentagemIva ?? 15}
          min={0}
          max={100}
          step="0.1"
          onChange={(e) =>
            onChange("percentagemIva", parseFloat(e.target.value))
          }
          className="w-14 rounded border-0 bg-transparent text-right text-xs focus:outline-none focus:bg-gray-50 focus:ring-1 focus:ring-blue-300 px-1.5 py-0.5"
        />
      </td>
      <td className="px-2 py-1.5 text-right text-xs font-medium text-gray-800">
        {fmt(total)}
      </td>
      <td className="px-2 py-1.5 text-center">
        <button
          type="button"
          onClick={onRemove}
          className="text-gray-300 hover:text-red-500 transition-colors text-base leading-none"
        >
          ×
        </button>
      </td>
    </tr>
  );
}

export default function FaturaCompraDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { data: fatura, isLoading, isError, error } = useFaturaCompra(id);
  const { mutateAsync: confirmar, isPending: isConfirming } =
    useConfirmarFaturaCompra();
  const { mutateAsync: atualizar } = useAtualizarFaturaCompra();
  const { data: fornecedoresPage } = useFornecedores();
  const fornecedores = fornecedoresPage?.content ?? [];

  const [itens, setItens] = useState<ItemFaturaCompra[]>([]);
  const [fornecedorSearch, setFornecedorSearch] = useState("");
  const [showFornecedorDD, setShowFornecedorDD] = useState(false);
  const [selectedFornecedorId, setSelectedFornecedorId] = useState<
    number | undefined
  >();
  const [serie, setSerie] = useState("");
  const [data_, setData_] = useState("");
  const [condicoes, setCondicoes] = useState("3 dias");
  const [nota, setNota] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (fatura) {
      setItens(fatura.itens ?? []);
      setSelectedFornecedorId(fatura.fornecedorId);
      setFornecedorSearch(fatura.fornecedorNome ?? "");
      setSerie(fatura.dataEmissao?.split("-")[0] ?? "");
      setData_(fatura.dataEmissao?.split("T")[0] ?? "");
      setNota(fatura.observacoes ?? "");
    }
  }, [fatura]);

  const fornecedoresFiltrados = fornecedores.filter((f) =>
    f.nome.toLowerCase().includes(fornecedorSearch.toLowerCase()),
  );
  const fornecedorSelecionado = fornecedores.find(
    (f) => f.id === selectedFornecedorId,
  );

  function addLinha() {
    setItens((prev) => [
      ...prev,
      { descricao: "", quantidade: 1, precoUnitario: 0, percentagemIva: 15 },
    ]);
  }

  function updateItem(
    index: number,
    field: keyof ItemFaturaCompra,
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
  const totalIva = itens.reduce((acc, item) => {
    const base = (item.quantidade || 0) * (item.precoUnitario || 0);
    return acc + base * ((item.percentagemIva || 0) / 100);
  }, 0);
  const total = subtotal + totalIva;

  async function handleSave() {
    if (!selectedFornecedorId) return;
    setSaving(true);
    try {
      await atualizar({
        id,
        data: {
          fornecedorId: selectedFornecedorId,
          tipoDocumento: fatura?.tipoDocumento ?? "FATURA",
          observacoes: nota,
          itens: itens.map(
            ({ descricao, quantidade, precoUnitario, percentagemIva }) => ({
              descricao: descricao ?? "",
              quantidade: quantidade ?? 1,
              precoUnitario: precoUnitario ?? 0,
              percentagemIva: percentagemIva ?? 0,
            }),
          ),
        },
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
          type="button"
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
      <div className="mx-auto max-w-5xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h1 className="text-base font-semibold text-gray-800">
            Editar #{fatura.numero ?? `FC${id}`}
          </h1>
          <span
            className={`rounded-full px-3 py-0.5 text-xs font-medium ${
              fatura.estado === "CONFIRMADO"
                ? "bg-green-100 text-green-800"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {fatura.estado ?? "RASCUNHO"}
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Dados de Compra */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4 text-gray-400"
                aria-hidden="true"
              >
                <path d="M3 4h14M3 8h14M3 12h14M3 16h8" />
              </svg>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Dados de Compra
              </h2>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="numDocumento" className="text-xs text-gray-500">
                  Nº Documento
                </label>
                <input
                  id="numDocumento"
                  disabled
                  value={fatura.numero ?? `FC${id}`}
                  className="h-8 rounded border border-gray-200 bg-gray-50 px-2.5 text-xs text-gray-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="serie" className="text-xs text-gray-500">
                  Série <span className="text-red-400">*</span>
                </label>
                <select
                  id="serie"
                  value={serie}
                  onChange={(e) => setSerie(e.target.value)}
                  className="h-8 rounded border border-gray-300 bg-white px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  <option>2023A</option>
                  <option>2024A</option>
                  <option>2025A</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="dataFatura" className="text-xs text-gray-500">
                  Data <span className="text-red-400">*</span>
                </label>
                <input
                  id="dataFatura"
                  type="date"
                  value={data_}
                  onChange={(e) => setData_(e.target.value)}
                  className="h-8 rounded border border-gray-300 bg-white px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="condicoes" className="text-xs text-gray-500">
                  Condições Pagamento <span className="text-red-400">*</span>
                </label>
                <select
                  id="condicoes"
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

          {/* Dados do Fornecedor */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4 text-gray-400"
                aria-hidden="true"
              >
                <rect x="1" y="3" width="15" height="13" rx="1" />
                <path d="M16 8h4l3 5v3h-7V8z" />
              </svg>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Dados do Fornecedor
              </h2>
            </div>
            <div className="relative">
              <label
                htmlFor="fornecedorSearch"
                className="mb-1 block text-xs text-gray-500"
              >
                Fornecedor
              </label>
              <div className="flex h-8 items-center rounded border border-gray-300 bg-white">
                <input
                  id="fornecedorSearch"
                  value={
                    fornecedorSelecionado
                      ? `${fornecedorSelecionado.nome} - ${fornecedorSelecionado.nif ?? ""} -`
                      : fornecedorSearch
                  }
                  onChange={(e) => {
                    setFornecedorSearch(e.target.value);
                    setShowFornecedorDD(true);
                    setSelectedFornecedorId(undefined);
                  }}
                  onFocus={() => setShowFornecedorDD(true)}
                  className="flex-1 px-2.5 text-xs focus:outline-none bg-transparent"
                />
                {selectedFornecedorId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFornecedorId(undefined);
                      setFornecedorSearch("");
                    }}
                    className="px-2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
              {showFornecedorDD && fornecedoresFiltrados.length > 0 && (
                <>
                  <button
                    type="button"
                    aria-label="Fechar lista de fornecedores"
                    className="fixed inset-0 z-10 cursor-default"
                    onClick={() => setShowFornecedorDD(false)}
                  />
                  <div className="absolute z-20 mt-1 w-full rounded border border-gray-200 bg-white shadow-md max-h-40 overflow-y-auto">
                    {fornecedoresFiltrados.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setSelectedFornecedorId(f.id);
                          setFornecedorSearch(f.nome);
                          setShowFornecedorDD(false);
                        }}
                        className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs hover:bg-gray-50"
                      >
                        <span>{f.nome}</span>
                        <span className="text-gray-400">{f.nif}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Items */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-4 w-4 text-gray-400"
                  aria-hidden="true"
                >
                  <path d="M4 6h12M4 10h12M4 14h6" />
                </svg>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Produto / Serviço
                </h2>
              </div>
              <button
                type="button"
                onClick={addLinha}
                className="flex items-center gap-1.5 rounded border border-blue-400 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
              >
                + Adicionar Linha
              </button>
            </div>

            <div className="overflow-x-auto rounded border border-gray-200">
              <table className="w-full min-w-[640px] text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-8 px-2 py-2 text-center text-gray-500 font-medium">
                      #
                    </th>
                    <th className="px-2 py-2 text-left text-gray-500 font-medium">
                      Descrição
                    </th>
                    <th className="w-14 px-2 py-2 text-center text-gray-500 font-medium">
                      Qtd.
                    </th>
                    <th className="w-20 px-2 py-2 text-right text-gray-500 font-medium">
                      Preço/Unid
                    </th>
                    <th className="w-16 px-2 py-2 text-right text-gray-500 font-medium">
                      IVA %
                    </th>
                    <th className="w-20 px-2 py-2 text-right text-gray-500 font-medium">
                      Total
                    </th>
                    <th className="w-8 px-2 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {itens.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-6 text-center text-gray-400"
                      >
                        Adicione itens à fatura
                      </td>
                    </tr>
                  ) : (
                    itens.map((item, i) => (
                      <LinhaItem
                        key={item.id ?? i}
                        item={item}
                        index={i}
                        onChange={(f, v) => updateItem(i, f, v)}
                        onRemove={() => removeItem(i)}
                      />
                    ))
                  )}
                  <tr className="border-t border-gray-200 bg-blue-500 text-white text-xs font-semibold">
                    <td className="px-2 py-2 text-center">#</td>
                    <td colSpan={4} className="px-2 py-2">
                      SubTotal:
                    </td>
                    <td className="px-2 py-2 text-right">{fmt(subtotal)}</td>
                    <td />
                  </tr>
                  <tr className="border-t border-gray-200 bg-blue-600 text-white text-xs font-semibold">
                    <td className="px-2 py-2 text-center">#</td>
                    <td colSpan={4} className="px-2 py-2">
                      Total a pagar:
                    </td>
                    <td className="px-2 py-2 text-right">{fmt(total)}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Nota */}
          <div className="flex flex-col gap-1">
            <label htmlFor="nota" className="text-xs text-gray-500">
              Nota
            </label>
            <textarea
              id="nota"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={3}
              className="rounded border border-gray-300 bg-white px-2.5 py-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => router.push("/faturas-compra")}
              className="rounded border border-gray-300 px-5 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
            >
              Fechar
            </button>
            <div className="flex gap-2">
              {fatura.estado === "RASCUNHO" && (
                <button
                  type="button"
                  onClick={() => confirmar(id)}
                  disabled={isConfirming}
                  className="rounded bg-green-600 px-5 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-60"
                >
                  {isConfirming ? "A confirmar…" : "Confirmar"}
                </button>
              )}
              <button
                type="button"
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
