"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type {
  SerieDocumento,
  TaxaIva,
  TipoDocumento,
} from "@/app/(myapp)/types/efatura";
import { parametrizacaoApi } from "@/lib/api/parametrizacao";

// ── Taxas IVA Tab ─────────────────────────────────────────────

function TaxasIvaTab() {
  const qc = useQueryClient();
  const { data: taxas = [], isLoading } = useQuery({
    queryKey: ["taxas-iva"],
    queryFn: () => parametrizacaoApi.taxasIva.listar(),
  });

  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<TaxaIva>>({
    ativo: true,
    percentagem: 15,
  });

  const save = useMutation({
    mutationFn: () =>
      editId
        ? parametrizacaoApi.taxasIva.atualizar(editId, form)
        : parametrizacaoApi.taxasIva.criar(form as Omit<TaxaIva, "id">),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["taxas-iva"] });
      setShowForm(false);
      setEditId(null);
      setForm({ ativo: true, percentagem: 15 });
    },
  });

  function openEdit(taxa: TaxaIva) {
    setEditId(taxa.id ?? null);
    setForm({ ...taxa });
    setShowForm(true);
  }

  function openNew() {
    setEditId(null);
    setForm({ ativo: true, percentagem: 15 });
    setShowForm(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Taxas IVA</h2>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
        >
          <span className="text-base leading-none">+</span> Nova Taxa
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">
            {editId ? "Editar Taxa IVA" : "Nova Taxa IVA"}
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">
                Código <span className="text-red-400">*</span>
              </label>
              <input
                value={form.codigo ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, codigo: e.target.value }))
                }
                placeholder="Ex: IVA15"
                className="h-8 rounded border border-gray-300 bg-white px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-xs text-gray-500">
                Descrição <span className="text-red-400">*</span>
              </label>
              <input
                value={form.descricao ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, descricao: e.target.value }))
                }
                placeholder="Ex: IVA Normal 15%"
                className="h-8 rounded border border-gray-300 bg-white px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">
                Percentagem (%) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={form.percentagem ?? ""}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    percentagem: parseFloat(e.target.value),
                  }))
                }
                className="h-8 rounded border border-gray-300 bg-white px-2.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.ativo ?? true}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, ativo: e.target.checked }))
                  }
                  className="rounded border-gray-300"
                />
                Ativo
              </label>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => save.mutate()}
              disabled={save.isPending}
              className="rounded bg-blue-600 px-5 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {save.isPending ? "A guardar…" : "Guardar"}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditId(null);
              }}
              className="rounded border border-gray-300 px-5 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-gray-400">
            A carregar…
          </div>
        ) : taxas.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">
            Nenhuma taxa configurada
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-2.5 text-left font-medium text-gray-600">
                  Código
                </th>
                <th className="px-4 py-2.5 text-left font-medium text-gray-600">
                  Descrição
                </th>
                <th className="px-4 py-2.5 text-right font-medium text-gray-600">
                  Percentagem
                </th>
                <th className="px-4 py-2.5 text-center font-medium text-gray-600">
                  Estado
                </th>
                <th className="px-4 py-2.5 text-center font-medium text-gray-600">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {taxas.map((taxa) => (
                <tr key={taxa.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-700">
                    {taxa.codigo}
                  </td>
                  <td className="px-4 py-2.5 text-gray-700">
                    {taxa.descricao}
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-gray-800">
                    {taxa.percentagem}%
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        taxa.ativo
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {taxa.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      onClick={() => openEdit(taxa)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Séries Tab ────────────────────────────────────────────────

const TIPOS_DOCUMENTO: { value: TipoDocumento; label: string }[] = [
  { value: "FATURA", label: "Fatura" },
  { value: "FATURA_RECIBO", label: "Fatura-Recibo" },
  { value: "NOTA_CREDITO", label: "Nota de Crédito" },
  { value: "NOTA_DEBITO", label: "Nota de Débito" },
  { value: "RECIBO", label: "Recibo" },
  { value: "TALAO_VENDA", label: "Talão de Venda" },
  { value: "FATURA_PROFORMA", label: "Fatura Proforma" },
];

function SeriesTab() {
  const qc = useQueryClient();
  const { data: series = [], isLoading } = useQuery({
    queryKey: ["series"],
    queryFn: () => parametrizacaoApi.series.listar(),
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<SerieDocumento>>({
    ativo: true,
    anoFiscal: new Date().getFullYear(),
    ultimoNumero: 0,
    tipoDocumento: "FATURA",
  });

  const save = useMutation({
    mutationFn: () =>
      parametrizacaoApi.series.criar(form as Omit<SerieDocumento, "id">),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["series"] });
      setShowForm(false);
      setForm({
        ativo: true,
        anoFiscal: new Date().getFullYear(),
        ultimoNumero: 0,
        tipoDocumento: "FATURA",
      });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">
          Séries de Documento
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
        >
          <span className="text-base leading-none">+</span> Nova Série
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">
            Nova Série
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">
                Código <span className="text-red-400">*</span>
              </label>
              <input
                value={form.codigo ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, codigo: e.target.value }))
                }
                placeholder="Ex: FT2025"
                className="h-8 rounded border border-gray-300 bg-white px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-xs text-gray-500">
                Descrição <span className="text-red-400">*</span>
              </label>
              <input
                value={form.descricao ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, descricao: e.target.value }))
                }
                placeholder="Ex: Faturas 2025"
                className="h-8 rounded border border-gray-300 bg-white px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">
                Tipo de Documento <span className="text-red-400">*</span>
              </label>
              <select
                value={form.tipoDocumento}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    tipoDocumento: e.target.value as TipoDocumento,
                  }))
                }
                className="h-8 rounded border border-gray-300 bg-white px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                {TIPOS_DOCUMENTO.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">
                Prefixo <span className="text-red-400">*</span>
              </label>
              <input
                value={form.prefixo ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, prefixo: e.target.value }))
                }
                placeholder="Ex: FT"
                className="h-8 rounded border border-gray-300 bg-white px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">
                Ano Fiscal <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min={2020}
                max={2099}
                value={form.anoFiscal ?? ""}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    anoFiscal: parseInt(e.target.value),
                  }))
                }
                className="h-8 rounded border border-gray-300 bg-white px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => save.mutate()}
              disabled={save.isPending}
              className="rounded bg-blue-600 px-5 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {save.isPending ? "A guardar…" : "Guardar"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded border border-gray-300 px-5 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-gray-400">
            A carregar…
          </div>
        ) : series.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">
            Nenhuma série configurada
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-2.5 text-left font-medium text-gray-600">
                  Código
                </th>
                <th className="px-4 py-2.5 text-left font-medium text-gray-600">
                  Descrição
                </th>
                <th className="px-4 py-2.5 text-left font-medium text-gray-600">
                  Tipo Documento
                </th>
                <th className="px-4 py-2.5 text-center font-medium text-gray-600">
                  Prefixo
                </th>
                <th className="px-4 py-2.5 text-center font-medium text-gray-600">
                  Ano
                </th>
                <th className="px-4 py-2.5 text-center font-medium text-gray-600">
                  Último Nº
                </th>
                <th className="px-4 py-2.5 text-center font-medium text-gray-600">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {series.map((serie) => (
                <tr key={serie.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-700">
                    {serie.codigo}
                  </td>
                  <td className="px-4 py-2.5 text-gray-700">
                    {serie.descricao}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-600">
                    {serie.tipoDocumento}
                  </td>
                  <td className="px-4 py-2.5 text-center font-mono text-xs text-gray-700">
                    {serie.prefixo}
                  </td>
                  <td className="px-4 py-2.5 text-center text-gray-700">
                    {serie.anoFiscal}
                  </td>
                  <td className="px-4 py-2.5 text-center font-medium text-gray-800">
                    {serie.ultimoNumero}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        serie.ativo
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {serie.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────

type Tab = "taxas" | "series";

export default function ParametrizacaoPage() {
  const [tab, setTab] = useState<Tab>("taxas");

  return (
    <div className="flex flex-col gap-0 p-0">
      <div className="border-b border-gray-200 bg-white px-6 py-2.5">
        <nav className="flex items-center gap-1 text-xs text-gray-500">
          <a href="/" className="hover:text-gray-700">
            Página Inicial
          </a>
          <span>/</span>
          <span className="text-gray-700 font-medium">Parametrização</span>
        </nav>
      </div>

      <div className="p-5">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4 text-blue-500"
              >
                <path d="M11.5 4a7.5 7.5 0 100 12 7.5 7.5 0 000-12zM2 10h2M16 10h2M10 2v2M10 16v2" />
              </svg>
              <h1 className="text-sm font-semibold text-gray-800">
                Parametrização
              </h1>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50 px-5">
            {(["taxas", "series"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                  tab === t
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t === "taxas" ? "Taxas IVA" : "Séries de Documento"}
              </button>
            ))}
          </div>

          <div className="p-5">
            {tab === "taxas" ? <TaxasIvaTab /> : <SeriesTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
