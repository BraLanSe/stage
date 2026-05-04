/* IGRP-GENERATED-PAGE */
"use client";

/* IGRP-CUSTOM-CODE-BEGIN(imports) */
import type React from "react";
import {
  IGRPButton,
  IGRPCard,
  IGRPCardContent,
  IGRPContainer,
  IGRPInputNumber,
  IGRPInputText,
  IGRPPageHeader,
  IGRPSelect,
  IGRPTextarea,
} from "@igrp/igrp-framework-react-design-system";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Entidade } from "@/app/(myapp)/types/efatura";
import { useAtualizarEntidade, useEntidade } from "@/hooks/use-cadastro";
/* IGRP-CUSTOM-CODE-END */

/* IGRP-CUSTOM-CODE-BEGIN(constants) */
const ILHAS = [
  "SANTIAGO",
  "SÃO VICENTE",
  "SÃO ANTÃO",
  "FOGO",
  "BRAVA",
  "MAIO",
  "SAL",
  "BOA VISTA",
  "SÃO NICOLAU",
];

const CONSELHOS: Record<string, string[]> = {
  SANTIAGO: [
    "PRAIA",
    "SANTA CATARINA",
    "SÃO DOMINGOS",
    "TARRAFAL",
    "SÃO MIGUEL",
    "RIBEIRA GRANDE DE SANTIAGO",
  ],
  "SÃO VICENTE": ["SÃO VICENTE"],
  "SÃO ANTÃO": ["PORTO NOVO", "RIBEIRA GRANDE", "PAUL"],
  FOGO: ["SÃO FILIPE", "MOSTEIROS"],
  BRAVA: ["NOVA SINTRA"],
  MAIO: ["MAIO"],
  SAL: ["SAL"],
  "BOA VISTA": ["BOA VISTA"],
  "SÃO NICOLAU": ["RIBEIRA BRAVA", "TARRAFAL DE SÃO NICOLAU"],
};

const ENQUADRAMENTOS = [
  { value: "CONTABILIDADE_ORGANIZADA", label: "Contabilidade Organizada" },
  { value: "REGIME_SIMPLIFICADO", label: "Regime Simplificado" },
  { value: "ISENTO", label: "Isento" },
  { value: "PEQUENO_CONTRIBUINTE", label: "Pequeno Contribuinte" },
  { value: "REMP", label: "REMP — Regime Especial Micro e Pequenas Empresas" },
];

const PAISES = [
  { value: "CPV", label: "CAPE VERDE" },
  { value: "PRT", label: "PORTUGAL" },
  { value: "BRA", label: "BRASIL" },
];

const MOEDAS = [
  { value: "CVE", label: "CVE (Escudo Cabo-Verdiano)" },
  { value: "EUR", label: "EUR (Euro)" },
  { value: "USD", label: "USD (Dólar Americano)" },
];

function getTaxaIvaPadrao(enquadramento: string | undefined): number {
  if (!enquadramento) return 15;
  if (enquadramento === "ISENTO" || enquadramento === "PEQUENO_CONTRIBUINTE") return 0;
  if (enquadramento === "REMP") return 4;
  return 15;
}

const LS_MOEDA = "efatura_moeda";
const LS_TAXA_IVA = "efatura_taxa_iva_padrao";

function loadFromStorage() {
  if (typeof window === "undefined") return { moeda: "CVE", taxaIva: 15 };
  return {
    moeda: localStorage.getItem(LS_MOEDA) ?? "CVE",
    taxaIva: Number(localStorage.getItem(LS_TAXA_IVA) ?? "15"),
  };
}
/* IGRP-CUSTOM-CODE-END */

export default function EmpresaPage() {
  /* IGRP-CUSTOM-CODE-BEGIN(hooks) */
  const { data: entidade, isLoading } = useEntidade();
  const { mutateAsync: atualizar, isPending } = useAtualizarEntidade();

  const [form, setForm] = useState<Partial<Entidade>>({
    nome: "",
    abreviacao: "",
    nif: "",
    email: "",
    telefone: "",
    registoComercial: "",
    endereco: "",
    ilha: "SANTIAGO",
    conselho: "PRAIA",
    freguesia: "",
    localidade: "",
    enquadramento: "",
    pais: "CPV",
  });

  const stored = loadFromStorage();
  const [moeda, setMoeda] = useState<string>(stored.moeda);
  const [taxaIvaPadrao, setTaxaIvaPadrao] = useState<number>(stored.taxaIva);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (entidade) {
      setForm({
        id: entidade.id,
        nome: entidade.nome ?? "",
        abreviacao: entidade.abreviacao ?? "",
        nif: entidade.nif ?? "",
        email: entidade.email ?? "",
        telefone: entidade.telefone ?? "",
        registoComercial: entidade.registoComercial ?? "",
        endereco: entidade.endereco ?? "",
        ilha: entidade.ilha ?? "SANTIAGO",
        conselho: entidade.conselho ?? "PRAIA",
        freguesia: entidade.freguesia ?? "",
        localidade: entidade.localidade ?? "",
        enquadramento: entidade.enquadramento ?? "",
        pais: entidade.pais ?? "CPV",
      });
      if (entidade.logoUrl) setFotoPreview(entidade.logoUrl);
      const taxa = getTaxaIvaPadrao(entidade.enquadramento ?? "");
      setTaxaIvaPadrao(taxa);
    }
  }, [entidade]);

  function handleEnquadramentoChange(v: string) {
    setForm((p) => ({ ...p, enquadramento: v }));
    const taxa = getTaxaIvaPadrao(v);
    setTaxaIvaPadrao(taxa);
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_TAXA_IVA, String(taxa));
    }
  }

  function handleMoedaChange(v: string) {
    setMoeda(v);
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_MOEDA, v);
    }
  }

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setFotoPreview(url);
      setForm((p) => ({ ...p, logoUrl: url }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!form.nome?.trim()) {
      toast.error("O nome da empresa é obrigatório.");
      return;
    }
    try {
      await atualizar({ ...form });
      if (typeof window !== "undefined") {
        localStorage.setItem(LS_MOEDA, moeda);
        localStorage.setItem(LS_TAXA_IVA, String(taxaIvaPadrao));
      }
      toast.success("Perfil da empresa guardado com sucesso!");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro ao guardar perfil.";
      toast.error(msg);
    }
  }

  const conselhos = CONSELHOS[form.ilha ?? "SANTIAGO"] ?? [];
  /* IGRP-CUSTOM-CODE-END */

  return (
    <IGRPContainer
      id="empresa"
      name="empresa"
      tag="empresa"
      className="flex flex-col gap-0 p-0 bg-[#f7f9fc]"
    >
      <IGRPButton name="force-studio" tag="force-studio" id="force-studio" className="sr-only">
        FORCE
      </IGRPButton>
      <IGRPPageHeader
        name="empresa-header"
        tag="empresa-header"
        title="Perfil da Empresa"
        description="Informações da empresa e parametrizações fiscais"
        className="border-b px-6 py-3 bg-white"
      />

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground text-sm animate-pulse">
          A carregar dados da empresa…
        </div>
      ) : (
        <div className="p-5 flex flex-col gap-5 max-w-5xl">
          {/* Main card */}
          <IGRPCard
            name="card-empresa"
            tag="card-empresa"
            className="rounded-2xl shadow-[0_2px_12px_rgba(53,121,246,0.07)] border border-slate-100"
          >
            <IGRPCardContent className="p-6">
              <div className="flex gap-6">
                {/* Photo / Logo section */}
                <div className="flex flex-col items-start gap-3 w-44 flex-shrink-0">
                  <p className="text-sm font-medium text-gray-700">Foto</p>
                  <div className="relative w-44 h-48 border-2 border-dashed border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                    {fotoPreview ? (
                      <>
                        {/* biome-ignore lint/performance/noImgElement: local/api preview */}
                        <img
                          src={fotoPreview}
                          alt="Logo"
                          className="w-full h-full object-contain p-2"
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full shadow text-xs text-gray-500 hover:text-red-500 flex items-center justify-center"
                          onClick={() => {
                            setFotoPreview(null);
                            setForm((p) => ({ ...p, logoUrl: undefined }));
                          }}
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs font-medium">
                        Logo
                      </span>
                    )}
                  </div>
                  <label className="cursor-pointer w-full">
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleFotoChange}
                    />
                    <span className="inline-flex items-center gap-1.5 w-full justify-center rounded-lg bg-[#3579f6] px-3 py-2 text-xs font-medium text-white hover:bg-[#2b65d4] transition-colors">
                      📷 Selecione a Photo
                    </span>
                  </label>
                </div>

                {/* Main fields */}
                <div className="flex-1 space-y-4 min-w-0">
                  <div className="grid grid-cols-2 gap-3">
                    <IGRPInputText
                      name="codigo"
                      tag="input-empresa-codigo"
                      label="Código"
                      disabled
                      value={entidade?.codigo ?? ""}
                    />
                    <div />
                    <IGRPInputText
                      name="nome"
                      tag="input-empresa-nome"
                      label="Nome"
                      required
                      value={form.nome ?? ""}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, nome: e.target.value }))
                      }
                    />
                    <IGRPInputText
                      name="abreviacao"
                      tag="input-empresa-abreviacao"
                      label="Abreviação"
                      required
                      value={form.abreviacao ?? ""}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, abreviacao: e.target.value }))
                      }
                    />
                    <IGRPInputText
                      name="email"
                      tag="input-empresa-email"
                      label="Email"
                      type="email"
                      value={form.email ?? ""}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, email: e.target.value }))
                      }
                    />
                    <IGRPInputText
                      name="telefone"
                      tag="input-empresa-telefone"
                      label="Telefone"
                      value={form.telefone ?? ""}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, telefone: e.target.value }))
                      }
                    />
                    <IGRPInputText
                      name="nif"
                      tag="input-empresa-nif"
                      label="Nif"
                      required
                      value={form.nif ?? ""}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, nif: e.target.value }))
                      }
                    />
                    <IGRPInputText
                      name="registoComercial"
                      tag="input-empresa-registo"
                      label="Registo Comercial"
                      value={form.registoComercial ?? ""}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          registoComercial: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <IGRPInputText
                    name="endereco"
                    tag="input-empresa-endereco"
                    label="Endereço"
                    value={form.endereco ?? ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, endereco: e.target.value }))
                    }
                  />

                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                      📍 Localidade/Morada
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                      <IGRPSelect
                        name="ilha"
                        tag="select-empresa-ilha"
                        label="Ilha"
                        options={ILHAS.map((i) => ({ label: i, value: i }))}
                        value={form.ilha ?? "SANTIAGO"}
                        onValueChange={(v) =>
                          setForm((p) => ({
                            ...p,
                            ilha: v,
                            conselho: undefined,
                          }))
                        }
                      />
                      <IGRPSelect
                        name="conselho"
                        tag="select-empresa-conselho"
                        label="Conselho"
                        placeholder="Selecionar conselho…"
                        options={conselhos.map((c) => ({
                          label: c,
                          value: c,
                        }))}
                        value={form.conselho || undefined}
                        onValueChange={(v) =>
                          setForm((p) => ({ ...p, conselho: v }))
                        }
                      />
                      <IGRPInputText
                        name="freguesia"
                        tag="input-empresa-freguesia"
                        label="Freguesia"
                        value={form.freguesia ?? ""}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, freguesia: e.target.value }))
                        }
                      />
                      <IGRPInputText
                        name="localidade"
                        tag="input-empresa-localidade"
                        label="Localidade"
                        value={form.localidade ?? ""}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            localidade: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <IGRPSelect
                      name="enquadramento"
                      tag="select-empresa-enquadramento"
                      label="Enquadramento"
                      required
                      options={ENQUADRAMENTOS}
                      value={form.enquadramento || undefined}
                      onValueChange={handleEnquadramentoChange}
                    />
                    <IGRPSelect
                      name="pais"
                      tag="select-empresa-pais"
                      label="País"
                      required
                      options={PAISES}
                      value={form.pais ?? "CPV"}
                      onValueChange={(v) =>
                        setForm((p) => ({ ...p, pais: v }))
                      }
                    />
                  </div>
                </div>
              </div>
            </IGRPCardContent>
          </IGRPCard>

          {/* Parametrizações Fiscais */}
          <IGRPCard
            name="card-fiscal"
            tag="card-fiscal"
            className="rounded-2xl shadow-[0_2px_12px_rgba(53,121,246,0.07)] border border-slate-100"
          >
            <IGRPCardContent className="p-6">
              <h2 className="mb-4 text-base font-semibold border-l-[3px] border-[#3579f6] pl-2">
                Parametrizações Fiscais
              </h2>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {/* Moeda */}
                <IGRPSelect
                  name="moeda"
                  tag="select-empresa-moeda"
                  label="Moeda Padrão"
                  options={MOEDAS}
                  value={moeda}
                  onValueChange={handleMoedaChange}
                />

                {/* Taxa IVA */}
                <div>
                  <IGRPInputNumber
                    name="taxaIvaPadrao"
                    tag="input-empresa-taxa-iva"
                    label="Taxa IVA Padrão (%)"
                    min={0}
                    max={100}
                    step={0.1}
                    value={taxaIvaPadrao}
                    onChange={(v) => {
                      setTaxaIvaPadrao(v);
                      if (typeof window !== "undefined") {
                        localStorage.setItem(LS_TAXA_IVA, String(v));
                      }
                    }}
                  />
                  {form.enquadramento === "ISENTO" ||
                  form.enquadramento === "PEQUENO_CONTRIBUINTE" ? (
                    <p className="mt-1 text-xs text-amber-600">
                      Enquadramento isento — IVA automaticamente 0%.
                    </p>
                  ) : form.enquadramento === "REMP" ? (
                    <p className="mt-1 text-xs text-emerald-600">
                      Regime REMP — taxa reduzida de 4% aplicada automaticamente.
                    </p>
                  ) : form.enquadramento ? (
                    <p className="mt-1 text-xs text-[#3579f6]">
                      Taxa padrão aplicada às facturas de venda.
                    </p>
                  ) : null}
                </div>

                {/* Info badge */}
                <div className="flex items-end pb-1">
                  <div
                    className={`rounded-xl px-4 py-3 text-sm font-medium ${
                      taxaIvaPadrao === 0
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-[#3579f6]/10 text-[#3579f6] border border-[#3579f6]/20"
                    }`}
                  >
                    {taxaIvaPadrao === 0
                      ? "Isento de IVA"
                      : `IVA ${taxaIvaPadrao}% aplicável`}
                  </div>
                </div>
              </div>
            </IGRPCardContent>
          </IGRPCard>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <IGRPButton
              name="guardar-empresa"
              tag="btn-guardar-empresa"
              showIcon
              iconName="Save"
              loading={isPending}
              loadingText="A guardar…"
              disabled={!form.nome?.trim()}
              onClick={handleSave}
            >
              Guardar
            </IGRPButton>
          </div>
        </div>
      )}
    </IGRPContainer>
  );
}
