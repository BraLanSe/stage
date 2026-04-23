/* IGRP-GENERATED-PAGE */
"use client";

import {
  IGRPButton,
  IGRPCheckbox,
  IGRPContainer,
  IGRPInputNumber,
  IGRPInputText,
  IGRPPageHeader,
  IGRPSelect,
} from "@igrp/igrp-framework-react-design-system";
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
        <IGRPButton
          name="nova-taxa"
          tag="btn-nova-taxa"
          size="sm"
          showIcon
          iconName="Plus"
          onClick={openNew}
        >
          Nova Taxa
        </IGRPButton>
      </div>

      {showForm && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">
            {editId ? "Editar Taxa IVA" : "Nova Taxa IVA"}
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <IGRPInputText
              name="codigo-taxa"
              label="Código"
              required
              placeholder="Ex: IVA15"
              value={form.codigo ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, codigo: e.target.value }))}
            />
            <div className="col-span-2">
              <IGRPInputText
                name="descricao-taxa"
                label="Descrição"
                required
                placeholder="Ex: IVA Normal 15%"
                value={form.descricao ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
              />
            </div>
            <IGRPInputNumber
              name="percentagem-taxa"
              label="Percentagem (%)"
              required
              min={0}
              max={100}
              step={0.01}
              value={form.percentagem ?? 0}
              onChange={(v) => setForm((p) => ({ ...p, percentagem: v }))}
            />
            <div className="flex items-end pb-1">
              <IGRPCheckbox
                name="ativo-taxa"
                label="Ativo"
                checked={form.ativo ?? true}
                onCheckedChange={(checked) => setForm((p) => ({ ...p, ativo: !!checked }))}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <IGRPButton
              name="guardar-taxa"
              tag="btn-guardar-taxa"
              size="sm"
              loading={save.isPending}
              loadingText="A guardar…"
              onClick={() => save.mutate()}
            >
              Guardar
            </IGRPButton>
            <IGRPButton
              name="cancelar-taxa"
              tag="btn-cancelar-taxa"
              size="sm"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditId(null);
              }}
            >
              Cancelar
            </IGRPButton>
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
                    <IGRPButton
                      name="editar-taxa"
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(taxa)}
                    >
                      Editar
                    </IGRPButton>
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
        <IGRPButton
          name="nova-serie"
          tag="btn-nova-serie"
          size="sm"
          showIcon
          iconName="Plus"
          onClick={() => setShowForm(true)}
        >
          Nova Série
        </IGRPButton>
      </div>

      {showForm && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">
            Nova Série
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <IGRPInputText
              name="codigo-serie"
              label="Código"
              required
              placeholder="Ex: FT2025"
              value={form.codigo ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, codigo: e.target.value }))}
            />
            <div className="col-span-2">
              <IGRPInputText
                name="descricao-serie"
                label="Descrição"
                required
                placeholder="Ex: Faturas 2025"
                value={form.descricao ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
              />
            </div>
            <IGRPSelect
              name="tipoDocumento-serie"
              label="Tipo de Documento"
              required
              options={TIPOS_DOCUMENTO.map((t) => ({ label: t.label, value: t.value }))}
              value={form.tipoDocumento}
              onValueChange={(v) => setForm((p) => ({ ...p, tipoDocumento: v as TipoDocumento }))}
            />
            <IGRPInputText
              name="prefixo-serie"
              label="Prefixo"
              required
              placeholder="Ex: FT"
              value={form.prefixo ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, prefixo: e.target.value }))}
            />
            <IGRPInputNumber
              name="anoFiscal-serie"
              label="Ano Fiscal"
              required
              min={2020}
              max={2099}
              step={1}
              value={form.anoFiscal ?? new Date().getFullYear()}
              onChange={(v) => setForm((p) => ({ ...p, anoFiscal: v }))}
            />
          </div>
          <div className="mt-4 flex gap-2">
            <IGRPButton
              name="guardar-serie"
              tag="btn-guardar-serie"
              size="sm"
              loading={save.isPending}
              loadingText="A guardar…"
              onClick={() => save.mutate()}
            >
              Guardar
            </IGRPButton>
            <IGRPButton
              name="cancelar-serie"
              tag="btn-cancelar-serie"
              size="sm"
              variant="outline"
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </IGRPButton>
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
                    {serie.desig}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-600">
                    {serie.prFaturaTipo?.codigo}
                  </td>
                  <td className="px-4 py-2.5 text-center font-mono text-xs text-gray-700">
                    —
                  </td>
                  <td className="px-4 py-2.5 text-center text-gray-700">
                    —
                  </td>
                  <td className="px-4 py-2.5 text-center font-medium text-gray-800">
                    {serie.contador ?? 0}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        serie.estado === "ATIVO"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {serie.estado === "ATIVO" ? "Ativo" : "Inativo"}
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
    <IGRPContainer id="parametrizacao" name="parametrizacao" tag="parametrizacao" className="flex flex-col gap-0 p-0">
      <IGRPButton name="force-studio" tag="force-studio" id="force-studio" className="sr-only">FORCE</IGRPButton>
      <IGRPPageHeader
        name="parametrizacao-header"
        tag="parametrizacao-header"
        title="Parametrização"
        description="Configuração de taxas IVA e séries de documento"
        className="border-b px-6 py-3 bg-white"
      />

      <div className="p-5">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50 px-5">
            {(["taxas", "series"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
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
    </IGRPContainer>
  );
}
