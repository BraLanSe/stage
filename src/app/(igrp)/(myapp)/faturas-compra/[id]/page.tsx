/* IGRP-GENERATED-PAGE */
"use client";

import {
  IGRPAlert,
  IGRPBadge,
  IGRPButton,
  IGRPContainer,
  IGRPInputText,
  IGRPPageHeader,
  IGRPSelect,
  IGRPTextarea,
} from "@igrp/igrp-framework-react-design-system";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useFornecedores } from "@/hooks/use-cadastro";
import {
  useAtualizarFaturaCompra,
  useConfirmarFaturaCompra,
  useFaturaCompra,
} from "@/hooks/use-faturas-compra";

const MEIOS_PAGAMENTO = [
  { label: "Dinheiro", value: "DINHEIRO" },
  { label: "Cheque", value: "CHEQUE" },
  { label: "Transferência Bancária", value: "TRANSFERENCIA" },
  { label: "Cartão", value: "CARTAO" },
  { label: "Outro", value: "OUTRO" },
];

function fmt(v?: number | null) {
  if (v === undefined || v === null) return "0,00";
  return new Intl.NumberFormat("pt-CV", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

interface EditItem {
  id?: number;
  desig: string;
  quantidade: number;
  precoUnitario: number;
  percentagemIva: number;
}

function LinhaItem({
  item,
  index,
  onChange,
  onRemove,
  disabled,
}: {
  item: EditItem;
  index: number;
  onChange: (field: keyof EditItem, value: string | number) => void;
  onRemove: () => void;
  disabled: boolean;
}) {
  const base = (item.quantidade || 0) * (item.precoUnitario || 0);
  const total = base * (1 + (item.percentagemIva || 0) / 100);

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50">
      <td className="px-2 py-1.5 text-center text-xs text-gray-400">
        {index + 1}
      </td>
      <td className="px-2 py-1.5">
        <input
          value={item.desig}
          disabled={disabled}
          onChange={(e) => onChange("desig", e.target.value)}
          className="w-full min-w-[120px] rounded border-0 bg-transparent text-xs focus:outline-none focus:bg-gray-50 focus:ring-1 focus:ring-blue-300 px-1.5 py-0.5 disabled:cursor-not-allowed"
        />
      </td>
      <td className="px-2 py-1.5">
        <input
          type="number"
          value={item.quantidade}
          min={0}
          step="1"
          disabled={disabled}
          onChange={(e) => onChange("quantidade", parseFloat(e.target.value))}
          className="w-14 rounded border-0 bg-transparent text-right text-xs focus:outline-none focus:bg-gray-50 focus:ring-1 focus:ring-blue-300 px-1.5 py-0.5 disabled:cursor-not-allowed"
        />
      </td>
      <td className="px-2 py-1.5">
        <input
          type="number"
          value={item.precoUnitario}
          min={0}
          step="0.01"
          disabled={disabled}
          onChange={(e) => onChange("precoUnitario", parseFloat(e.target.value))}
          className="w-20 rounded border-0 bg-transparent text-right text-xs focus:outline-none focus:bg-gray-50 focus:ring-1 focus:ring-blue-300 px-1.5 py-0.5 disabled:cursor-not-allowed"
        />
      </td>
      <td className="px-2 py-1.5">
        <input
          type="number"
          value={item.percentagemIva}
          min={0}
          max={100}
          step="0.1"
          disabled={disabled}
          onChange={(e) => onChange("percentagemIva", parseFloat(e.target.value))}
          className="w-14 rounded border-0 bg-transparent text-right text-xs focus:outline-none focus:bg-gray-50 focus:ring-1 focus:ring-blue-300 px-1.5 py-0.5 disabled:cursor-not-allowed"
        />
      </td>
      <td className="px-2 py-1.5 text-right text-xs font-medium text-gray-800">
        {fmt(total)}
      </td>
      <td className="px-2 py-1.5 text-center">
        {!disabled && (
          <button
            type="button"
            onClick={onRemove}
            className="text-gray-300 hover:text-red-500 transition-colors text-base leading-none"
          >
            ×
          </button>
        )}
      </td>
    </tr>
  );
}

export default function FaturaCompraDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { data: fatura, isLoading, isError, error } = useFaturaCompra(id);
  const { mutateAsync: confirmar, isPending: isConfirming } = useConfirmarFaturaCompra();
  const { mutateAsync: atualizar } = useAtualizarFaturaCompra();
  const { data: fornecedoresPage } = useFornecedores();
  const fornecedores = fornecedoresPage?.content ?? [];

  const [itens, setItens] = useState<EditItem[]>([]);
  const [fornecedorSearch, setFornecedorSearch] = useState("");
  const [showFornecedorDD, setShowFornecedorDD] = useState(false);
  const [selectedFornecedorId, setSelectedFornecedorId] = useState<number | undefined>();
  const [data_, setData_] = useState("");
  const [condicoes, setCondicoes] = useState("");
  const [nota, setNota] = useState("");
  const [meioPagamento, setMeioPagamento] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!fatura) return;
    setItens(
      (fatura.items ?? []).map((item) => {
        const ivaPerc =
          item.valorBruto && Number(item.valorBruto) > 0
            ? Math.round((Number(item.valorImposto ?? 0) / Number(item.valorBruto)) * 100)
            : 0;
        return {
          id: item.id,
          desig: item.desig ?? "",
          quantidade: Number(item.quantidade ?? 1),
          precoUnitario: Number(item.precoUnitario ?? 0),
          percentagemIva: ivaPerc,
        };
      }),
    );
    setSelectedFornecedorId(fatura.fornecedor?.id);
    setFornecedorSearch(fatura.fornecedor?.desig ?? "");
    setData_(fatura.dtFaturacao?.toString().split("T")[0] ?? "");
    setCondicoes(fatura.termCondicoes ?? "");
    setNota(fatura.nota ?? "");
    setMeioPagamento(fatura.meioPagamento ?? "");
  }, [fatura]);

  const fornecedoresFiltrados = fornecedores.filter((f) =>
    f.desig.toLowerCase().includes(fornecedorSearch.toLowerCase()),
  );
  const fornecedorSelecionado = fornecedores.find((f) => f.id === selectedFornecedorId);

  function addLinha() {
    setItens((prev) => [
      ...prev,
      { desig: "", quantidade: 1, precoUnitario: 0, percentagemIva: 15 },
    ]);
  }

  function updateItem(index: number, field: keyof EditItem, value: string | number) {
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
          nota,
          termCondicoes: condicoes,
          items: itens.map(({ desig, quantidade, precoUnitario, percentagemIva }) => ({
            desig: desig ?? "",
            quantidade: quantidade ?? 1,
            precoUnitario: precoUnitario ?? 0,
            percentagemIva: percentagemIva ?? 0,
          })),
        },
      });
      toast.success("Fatura guardada com sucesso!");
    } catch (err) {
      toast.error("Erro ao guardar fatura.");
      console.error(err);
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

  const isConfirmed = fatura.estado === "CONFIRMADO";
  const docLabel = fatura.codigo ?? `FC${id}`;

  return (
    <IGRPContainer id="faturas-compra-detalhe" name="faturas-compra-detalhe" tag="faturas-compra-detalhe" className="min-h-screen bg-gray-50">
      <IGRPButton name="force-studio" tag="force-studio" id="force-studio" className="sr-only">FORCE</IGRPButton>
      <div className="mx-auto max-w-5xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <IGRPPageHeader
            name="compra-detail-header"
            title={`Fatura de Compra #${docLabel}`}
            showBackButton
            urlBackButton="/faturas-compra"
            backButtonText="Faturas de Compra"
            className="border-0 p-0"
          />
          <IGRPBadge color={isConfirmed ? "success" : "secondary"}>
            {isConfirmed ? "Confirmado" : "Rascunho"}
          </IGRPBadge>
        </div>

        <div className="p-6 space-y-6">
          {isConfirmed && (
            <IGRPAlert variant="soft" color="warning">
              Esta fatura está confirmada e não pode ser editada.
            </IGRPAlert>
          )}

          {/* Dados de Compra */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
              Dados de Compra
            </h2>
            <div className="grid grid-cols-4 gap-3">
              <IGRPInputText
                name="numDocumento"
                label="Nº Documento"
                disabled
                value={docLabel}
              />
              <IGRPInputText
                name="serie"
                label="Série"
                disabled
                value={fatura.prSerie?.desig ?? fatura.prSerie?.codigo ?? "—"}
              />
              <IGRPInputText
                name="dataFatura"
                label="Data"
                type="date"
                required
                disabled={isConfirmed}
                value={data_}
                onChange={(e) => setData_(e.target.value)}
              />
              <IGRPSelect
                name="condicoes"
                label="Condições Pagamento"
                disabled={isConfirmed}
                options={[
                  { label: "A pronto", value: "A pronto" },
                  { label: "3 dias", value: "3 dias" },
                  { label: "7 dias", value: "7 dias" },
                  { label: "15 dias", value: "15 dias" },
                  { label: "30 dias", value: "30 dias" },
                  { label: "60 dias", value: "60 dias" },
                ]}
                value={condicoes}
                onValueChange={setCondicoes}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <IGRPSelect
                name="meioPagamento"
                label="Meio de Pagamento"
                disabled={isConfirmed}
                options={MEIOS_PAGAMENTO}
                value={meioPagamento}
                onValueChange={setMeioPagamento}
              />
              {fatura.dtVencimentoFatura && (
                <IGRPInputText
                  name="dtVencimento"
                  label="Data de Vencimento"
                  disabled
                  value={fatura.dtVencimentoFatura.toString().split("T")[0]}
                />
              )}
            </div>
          </section>

          {/* Dados do Fornecedor */}
          <section>
            <div className="flex items-center gap-2 mb-3">
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
              <div className={`flex h-8 items-center rounded border ${isConfirmed ? "border-gray-200 bg-gray-50" : "border-gray-300 bg-white"}`}>
                <input
                  id="fornecedorSearch"
                  disabled={isConfirmed}
                  value={
                    fornecedorSelecionado
                      ? `${fornecedorSelecionado.desig}${fornecedorSelecionado.nif ? ` — ${fornecedorSelecionado.nif}` : ""}`
                      : fornecedorSearch
                  }
                  onChange={(e) => {
                    setFornecedorSearch(e.target.value);
                    setShowFornecedorDD(true);
                    setSelectedFornecedorId(undefined);
                  }}
                  onFocus={() => !isConfirmed && setShowFornecedorDD(true)}
                  className="flex-1 px-2.5 text-xs focus:outline-none bg-transparent disabled:cursor-not-allowed"
                />
                {selectedFornecedorId && !isConfirmed && (
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
              {showFornecedorDD && !isConfirmed && fornecedoresFiltrados.length > 0 && (
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
                          setFornecedorSearch(f.desig);
                          setShowFornecedorDD(false);
                        }}
                        className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs hover:bg-gray-50"
                      >
                        <span>{f.desig}</span>
                        <span className="text-gray-400">{f.nif}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Dados Bancários */}
          {(fatura.fornecedorBanco || fatura.fornecedorIban || fatura.nossoBanco || fatura.nossoIban) && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                Dados Bancários
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {(fatura.fornecedorBanco || fatura.fornecedorIban) && (
                  <div className="rounded border border-gray-200 p-3 space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      Fornecedor
                    </p>
                    {fatura.fornecedorBanco && (
                      <div>
                        <p className="text-[10px] text-gray-500">Banco</p>
                        <p className="text-xs text-gray-800">{fatura.fornecedorBanco}</p>
                      </div>
                    )}
                    {fatura.fornecedorIban && (
                      <div>
                        <p className="text-[10px] text-gray-500">IBAN</p>
                        <p className="text-xs font-mono text-gray-800">{fatura.fornecedorIban}</p>
                      </div>
                    )}
                  </div>
                )}
                {(fatura.nossoBanco || fatura.nossoIban) && (
                  <div className="rounded border border-gray-200 p-3 space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      Nosso (Pagador)
                    </p>
                    {fatura.nossoBanco && (
                      <div>
                        <p className="text-[10px] text-gray-500">Banco</p>
                        <p className="text-xs text-gray-800">{fatura.nossoBanco}</p>
                      </div>
                    )}
                    {fatura.nossoIban && (
                      <div>
                        <p className="text-[10px] text-gray-500">IBAN</p>
                        <p className="text-xs font-mono text-gray-800">{fatura.nossoIban}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Items */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Produto / Serviço
              </h2>
              {!isConfirmed && (
                <IGRPButton
                  name="adicionar-linha"
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLinha}
                >
                  + Adicionar Linha
                </IGRPButton>
              )}
            </div>

            <div className="overflow-x-auto rounded border border-gray-200">
              <table className="w-full min-w-[640px] text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-8 px-2 py-2 text-center text-gray-500 font-medium">#</th>
                    <th className="px-2 py-2 text-left text-gray-500 font-medium">Descrição</th>
                    <th className="w-14 px-2 py-2 text-center text-gray-500 font-medium">Qtd.</th>
                    <th className="w-20 px-2 py-2 text-right text-gray-500 font-medium">Preço/Unid</th>
                    <th className="w-16 px-2 py-2 text-right text-gray-500 font-medium">IVA %</th>
                    <th className="w-20 px-2 py-2 text-right text-gray-500 font-medium">Total</th>
                    <th className="w-8 px-2 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {itens.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-gray-400">
                        Sem itens
                      </td>
                    </tr>
                  ) : (
                    itens.map((item, i) => (
                      <LinhaItem
                        key={item.id ?? i}
                        item={item}
                        index={i}
                        disabled={isConfirmed}
                        onChange={(f, v) => updateItem(i, f, v)}
                        onRemove={() => removeItem(i)}
                      />
                    ))
                  )}
                  <tr className="border-t border-gray-200 bg-blue-500 text-white text-xs font-semibold">
                    <td className="px-2 py-2 text-center">#</td>
                    <td colSpan={4} className="px-2 py-2">SubTotal:</td>
                    <td className="px-2 py-2 text-right">{fmt(subtotal)}</td>
                    <td />
                  </tr>
                  <tr className="border-t border-gray-200 bg-blue-600 text-white text-xs font-semibold">
                    <td className="px-2 py-2 text-center">#</td>
                    <td colSpan={4} className="px-2 py-2">Total a pagar:</td>
                    <td className="px-2 py-2 text-right">{fmt(total)}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Nota */}
          <IGRPTextarea
            name="nota"
            label="Nota"
            rows={3}
            disabled={isConfirmed}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
          />

          {/* Totais (summary row from server) */}
          {isConfirmed && (
            <div className="flex justify-end">
              <div className="rounded border border-gray-200 bg-gray-50 p-4 text-xs space-y-1 min-w-[200px]">
                <div className="flex justify-between gap-8">
                  <span className="text-gray-500">Valor Ilíquido</span>
                  <span className="font-medium">{fmt(fatura.valorIliquido as number | undefined)}</span>
                </div>
                <div className="flex justify-between gap-8">
                  <span className="text-gray-500">IVA</span>
                  <span className="font-medium">{fmt(fatura.valorImposto as number | undefined)}</span>
                </div>
                <div className="flex justify-between gap-8 border-t border-gray-200 pt-1 font-semibold">
                  <span>Total</span>
                  <span>{fmt(fatura.valorFatura as number | undefined)}</span>
                </div>
                {fatura.valorPago !== undefined && fatura.valorPago !== null && (
                  <div className="flex justify-between gap-8 text-green-700">
                    <span>Pago</span>
                    <span>{fmt(fatura.valorPago as number | undefined)}</span>
                  </div>
                )}
                {fatura.valorPorPagar !== undefined && fatura.valorPorPagar !== null && (
                  <div className="flex justify-between gap-8 text-orange-600">
                    <span>Por Pagar</span>
                    <span>{fmt(fatura.valorPorPagar as number | undefined)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <IGRPButton
              name="fechar"
              type="button"
              variant="outline"
              onClick={() => router.push("/faturas-compra")}
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
