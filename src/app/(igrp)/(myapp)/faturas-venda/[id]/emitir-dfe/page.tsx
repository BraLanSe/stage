"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { DFELed } from "@/app/(myapp)/types/efatura";
import { useEntidade } from "@/hooks/use-cadastro";
import { useFaturaVenda } from "@/hooks/use-faturas-venda";

// ── IUD generator ─────────────────────────────────────────────

function generateIUD(serie: string, numDoc: number): string {
  const now = Date.now();
  const rnd = Math.floor(Math.random() * 1e12)
    .toString()
    .padStart(12, "0");
  const base = `CV${now}${rnd}${numDoc}`.slice(0, 60).padEnd(60, "0");
  return base;
}

// ── Toggle ────────────────────────────────────────────────────

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
          checked ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
      <span className="text-xs text-gray-600">{label}</span>
    </label>
  );
}

// ── LED Search Modal ──────────────────────────────────────────

const MOCK_LEDS: DFELed[] = [
  { codigo: 1, descricao: "emissorPublico" },
  { codigo: 2, descricao: "emissorPRivado" },
  { codigo: 3, descricao: "naoEmissor" },
];

function LedSearch({
  onSelect,
  onClose,
}: {
  onSelect: (led: DFELed) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const filtered = MOCK_LEDS.filter(
    (l) =>
      l.descricao.toLowerCase().includes(q.toLowerCase()) ||
      String(l.codigo).includes(q),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-32">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white shadow-xl">
        <div className="flex items-center border-b border-gray-200 px-4 py-3">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pesquisar LED..."
            className="flex-1 text-sm focus:outline-none"
          />
          <button
            onClick={onClose}
            className="ml-2 text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>
        <div className="max-h-48 overflow-y-auto">
          {filtered.map((l) => (
            <button
              key={l.codigo}
              onClick={() => {
                onSelect(l);
                onClose();
              }}
              className="flex w-full items-center gap-4 px-4 py-2.5 hover:bg-gray-50 text-left text-sm"
            >
              <span className="text-gray-400 w-16">
                Código: <strong className="text-gray-700">{l.codigo}</strong>
              </span>
              <span className="text-gray-600">
                Descrição:{" "}
                <strong className="text-gray-700">{l.descricao}</strong>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────

function Section({
  icon,
  title,
  children,
  defaultOpen = false,
  color = "text-gray-700",
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  color?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-3 bg-white hover:bg-gray-50"
      >
        <div
          className={`flex items-center gap-2 font-semibold text-sm ${color}`}
        >
          {icon}
          {title}
        </div>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && (
        <div className="border-t border-blue-200 bg-white px-5 py-5">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Form field ────────────────────────────────────────────────

function Field({
  label,
  required,
  children,
  className = "col-span-1",
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500"> *</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "h-9 rounded border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400";

// ── Page ─────────────────────────────────────────────────────

export default function EmitirDFEPage() {
  const params = useParams();
  const router = useRouter();
  const faturaId = Number(params.id);

  const { data: fatura } = useFaturaVenda(faturaId);
  const { data: entidade } = useEntidade();

  // Toggles
  const [modoAutofaturacao, setModoAutofaturacao] = useState(false);
  const [atoIsolado, setAtoIsolado] = useState(false);
  const [camposAutomaticos, setCamposAutomaticos] = useState(true);
  const [xmlDFE, setXmlDFE] = useState(false);

  // Identificação
  const [iud, setIud] = useState(() => generateIUD("", 1));
  const [versao, setVersao] = useState("1.0");
  const [led, setLed] = useState<DFELed | null>(null);
  const [showLed, setShowLed] = useState(false);
  const [serie, setSerie] = useState("");
  const [numDocumento, setNumDocumento] = useState(1);
  const [dataEmissao, setDataEmissao] = useState("");
  const [horaEmissao, setHoraEmissao] = useState("");
  const [refEncomenda, setRefEncomenda] = useState("");
  const [dataImposto, setDataImposto] = useState("");

  // Pagamentos
  const [dataVencimento, setDataVencimento] = useState("");
  const [termosPagamento, setTermosPagamento] = useState("");

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (fatura) {
      setSerie(fatura.serie ?? "");
      const emissao = fatura.dataEmissao
        ? new Date(fatura.dataEmissao)
        : new Date();
      setDataEmissao(emissao.toISOString().split("T")[0]);
      setHoraEmissao(emissao.toTimeString().slice(0, 8));
      setDataVencimento(fatura.dataVencimento?.split("T")[0] ?? "");
      setNumDocumento(Number(fatura.numero?.replace(/\D/g, "")) || 1);
    }
  }, [fatura]);

  async function handleEmitir() {
    setSubmitting(true);
    try {
      // TODO: call DFE API endpoint when available
      // await dfeApi.emitir({ faturaId, iud, versao, led, serie, numDocumento, ... })
      await new Promise((r) => setTimeout(r, 800));
      router.push(`/faturas-venda/${faturaId}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showLed && (
        <LedSearch
          onSelect={(l) => setLed(l)}
          onClose={() => setShowLed(false)}
        />
      )}

      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-4 w-4 text-gray-500"
            >
              <line x1="5" y1="5" x2="15" y2="5" />
              <line x1="5" y1="10" x2="15" y2="10" />
              <line x1="5" y1="15" x2="10" y2="15" />
            </svg>
            <h1 className="text-sm font-semibold text-gray-800">
              + Emitir - Fatura Eletrónica
            </h1>
          </div>
          <button
            onClick={handleEmitir}
            disabled={submitting}
            className="flex items-center gap-2 rounded bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-4 w-4"
            >
              <path d="M3 10h14M10 3l7 7-7 7" />
            </svg>
            {submitting ? "A emitir…" : "Emitir"}
          </button>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-6 bg-white border-b border-gray-200 px-6 py-3">
          <Toggle
            label="Modo de Autofaturação?"
            checked={modoAutofaturacao}
            onChange={setModoAutofaturacao}
          />
          <Toggle
            label="Ato Isolado?"
            checked={atoIsolado}
            onChange={setAtoIsolado}
          />
          <Toggle
            label="Campos Automáticos?"
            checked={camposAutomaticos}
            onChange={setCamposAutomaticos}
          />
          <Toggle label="XML do DFE?" checked={xmlDFE} onChange={setXmlDFE} />
        </div>

        {/* Sections */}
        <div className="mt-0 space-y-0 border-l border-r border-gray-200">
          {/* Identificação do DFE */}
          <Section
            defaultOpen
            icon={
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4"
              >
                <path d="M10 2a2 2 0 00-2 2v1H5a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V6a1 1 0 00-1-1h-3V4a2 2 0 00-2-2zM8 5V4a2 2 0 114 0v1" />
              </svg>
            }
            title="Identificação do DFE"
          >
            <div className="grid grid-cols-4 gap-x-6 gap-y-4">
              {/* IUD */}
              <Field label="IUD" required className="col-span-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIud(generateIUD(serie, numDocumento))}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-blue-600 text-white hover:bg-blue-700"
                    title="Regenerar IUD"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4"
                    >
                      <path d="M4 12a8 8 0 0 1 13.66-4.24M16 4v4h-4" />
                      <path d="M16 8a8 8 0 0 1-13.66 4.24M4 16v-4h4" />
                    </svg>
                  </button>
                  <input
                    value={iud}
                    onChange={(e) => setIud(e.target.value)}
                    className="flex-1 h-9 rounded border border-gray-300 bg-white px-3 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  <button
                    type="button"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-blue-600 text-white hover:bg-blue-700"
                    title="Info"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </Field>

              {/* Versão */}
              <Field label="Versão" required>
                <input
                  value={versao}
                  onChange={(e) => setVersao(e.target.value)}
                  className={inputCls}
                />
              </Field>

              {/* LED */}
              <Field label="LED" required className="col-span-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLed(true)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="h-4 w-4"
                    >
                      <circle cx="8" cy="8" r="5" />
                      <path d="M18 18l-4-4" />
                    </svg>
                  </button>
                  <div className="flex flex-1 items-center rounded border border-gray-300 bg-white px-3 h-9 gap-4">
                    {led ? (
                      <>
                        <span className="text-xs text-gray-500">Código</span>
                        <span className="text-xs font-medium text-gray-800">
                          {led.codigo}
                        </span>
                        <span className="text-xs text-gray-500">Descrição</span>
                        <span className="text-xs font-medium text-gray-800">
                          {led.descricao}
                        </span>
                        <button
                          onClick={() => setLed(null)}
                          className="ml-auto text-gray-400 hover:text-gray-600 text-base leading-none"
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-300">
                        Selecionar LED…
                      </span>
                    )}
                  </div>
                </div>
              </Field>

              {/* Série */}
              <Field label="Série" required>
                <input
                  value={serie}
                  onChange={(e) => setSerie(e.target.value)}
                  className={inputCls}
                />
              </Field>

              {/* Nº Documento */}
              <Field label="Nº Documento" required>
                <input
                  type="number"
                  value={numDocumento}
                  onChange={(e) => setNumDocumento(parseInt(e.target.value))}
                  className={inputCls}
                />
              </Field>

              {/* Data de Emissão */}
              <Field label="Data de Emissão" required className="col-span-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 shrink-0">Data</span>
                    <input
                      type="date"
                      value={dataEmissao}
                      onChange={(e) => setDataEmissao(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 shrink-0">Hora</span>
                    <input
                      type="time"
                      step="1"
                      value={horaEmissao}
                      onChange={(e) => setHoraEmissao(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>
              </Field>

              {/* Ref. Encomenda */}
              <Field label="Ref. Encomenda" className="col-span-2">
                <input
                  value={refEncomenda}
                  onChange={(e) => setRefEncomenda(e.target.value)}
                  className={inputCls}
                />
              </Field>

              {/* Data Imposto */}
              <Field label="Data Imposto" required className="col-span-2">
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dataImposto}
                    onChange={(e) => setDataImposto(e.target.value)}
                    placeholder="AAAA-MM-DD"
                    className={`${inputCls} flex-1`}
                  />
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-500"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="h-4 w-4"
                    >
                      <rect x="3" y="4" width="14" height="13" rx="2" />
                      <path d="M7 2v3M13 2v3M3 9h14" />
                    </svg>
                  </button>
                </div>
              </Field>
            </div>
          </Section>

          {/* Emissor */}
          <Section
            icon={
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4"
              >
                <path d="M3 10l7-7 7 7" />
                <path d="M5 8v8a1 1 0 001 1h8a1 1 0 001-1V8" />
              </svg>
            }
            title="Emissor"
          >
            {entidade ? (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-gray-500">Nome</span>
                  <p className="font-medium text-gray-800">{entidade.nome}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">NIF</span>
                  <p className="font-medium text-gray-800">
                    {entidade.nif ?? "—"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Email</span>
                  <p className="text-gray-700">{entidade.email ?? "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Endereço</span>
                  <p className="text-gray-700">{entidade.endereco ?? "—"}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                Entidade emissora não configurada
              </p>
            )}
          </Section>

          {/* Recetor */}
          <Section
            icon={
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4"
              >
                <path d="M17 10l-7 7-7-7" />
                <path d="M15 12V4a1 1 0 00-1-1H6a1 1 0 00-1 1v8" />
              </svg>
            }
            title="Recetor"
          >
            {fatura ? (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-gray-500">Cliente</span>
                  <p className="font-medium text-gray-800">
                    {fatura.clienteNome ?? `Cliente ${fatura.clienteId}`}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Nº Documento</span>
                  <p className="font-medium text-gray-800">
                    {fatura.numero ?? fatura.codigo ?? `FT${faturaId}`}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                A carregar dados do recetor…
              </p>
            )}
          </Section>

          {/* Produtos/Serviços */}
          <Section
            icon={
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4"
              >
                <path d="M4 5h12M4 10h12M4 15h7" />
              </svg>
            }
            title="Produtos/Serviços"
          >
            {fatura?.itens && fatura.itens.length > 0 ? (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="pb-2 text-left font-medium">Código</th>
                    <th className="pb-2 text-left font-medium">Descrição</th>
                    <th className="pb-2 text-right font-medium">Qtd.</th>
                    <th className="pb-2 text-right font-medium">Preço Unit.</th>
                    <th className="pb-2 text-right font-medium">Total</th>
                    <th className="pb-2 text-center font-medium">Imposto</th>
                    <th className="pb-2 text-center font-medium">Retenção</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {fatura.itens.map((item, i) => {
                    const total =
                      (item.quantidade || 0) * (item.precoUnitario || 0);
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="py-2 font-mono text-gray-600">
                          {item.codigoArtigo ?? "—"}
                        </td>
                        <td className="py-2 text-gray-800">
                          {item.desig ?? item.descricao ?? "—"}
                        </td>
                        <td className="py-2 text-right">
                          {item.quantidade} {item.unidade ?? "EA"}
                        </td>
                        <td className="py-2 text-right">
                          {item.precoUnitario?.toFixed(2)} CVE
                        </td>
                        <td className="py-2 text-right font-medium">
                          {total.toFixed(2)} CVE
                        </td>
                        <td className="py-2 text-center text-gray-500">
                          {item.percentagemIva
                            ? `IVA ${item.percentagemIva}%`
                            : "—"}
                        </td>
                        <td className="py-2 text-center text-gray-400">
                          0 CVE
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-400">Sem itens</p>
            )}
          </Section>

          {/* Pagamentos */}
          <Section
            defaultOpen
            icon={
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4 text-blue-500"
              >
                <rect x="2" y="5" width="16" height="12" rx="2" />
                <path d="M2 9h16" />
              </svg>
            }
            title="Pagamentos"
            color="text-blue-600"
          >
            <div className="grid grid-cols-2 gap-6">
              <Field label="Data Vencimento">
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                    placeholder="AAAA-MM-DD"
                    className={`${inputCls} flex-1`}
                  />
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-500"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="h-4 w-4"
                    >
                      <rect x="3" y="4" width="14" height="13" rx="2" />
                      <path d="M7 2v3M13 2v3M3 9h14" />
                    </svg>
                  </button>
                </div>
              </Field>

              <Field label="Termos Pagamento">
                <textarea
                  value={termosPagamento}
                  onChange={(e) => setTermosPagamento(e.target.value)}
                  rows={3}
                  className="rounded border border-gray-300 bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </Field>
            </div>
          </Section>

          {/* Bank info footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-5 py-3">
            <p className="text-xs text-gray-500">
              Conta(s) bancária(s) que o emissor prefere que o pagamento seja
              feito.
            </p>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex items-center justify-between bg-white border-t border-gray-200 px-6 py-4">
          <button
            onClick={() => router.push(`/faturas-venda/${faturaId}`)}
            className="rounded border border-gray-300 px-5 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleEmitir}
            disabled={submitting}
            className="flex items-center gap-2 rounded bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-4 w-4"
            >
              <path d="M3 10h14M10 3l7 7-7 7" />
            </svg>
            {submitting ? "A emitir…" : "Emitir DFE"}
          </button>
        </div>
      </div>
    </div>
  );
}
