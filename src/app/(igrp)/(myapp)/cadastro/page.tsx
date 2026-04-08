"use client";

import { useState } from "react";
import type {
  Cliente,
  Fornecedor,
  TipoEntidade,
} from "@/app/(myapp)/types/efatura";
import {
  useAtualizarCliente,
  useAtualizarFornecedor,
  useClientes,
  useCriarCliente,
  useCriarFornecedor,
  useFornecedores,
} from "@/hooks/use-cadastro";

// ── Cape Verde geographic data ────────────────────────────────

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
const TIPOS_ENTIDADE: { value: TipoEntidade; label: string }[] = [
  { value: "SINGULAR", label: "Singular" },
  { value: "COLETIVO", label: "Coletivo" },
];

// ── Helpers ───────────────────────────────────────────────────

type Tab = "clientes" | "fornecedores";

function emptyCliente(): Omit<
  Cliente,
  "id" | "createdAt" | "updatedAt" | "createdBy" | "lastModifiedBy"
> {
  return {
    nome: "",
    tipoEntidade: "COLETIVO",
    ativo: true,
    codigo: "",
    nif: "",
    email: "",
    telefone: "",
    pessoaContacto: "",
    morada: "",
    endereco: "",
    ilha: "SANTIAGO",
    conselho: "PRAIA",
    freguesia: "",
    localidade: "",
    descricao: "",
    aplicarImpostos: false,
    enquadramento: "",
  };
}

function emptyFornecedor(): Omit<
  Fornecedor,
  "id" | "createdAt" | "updatedAt" | "createdBy" | "lastModifiedBy"
> {
  return {
    nome: "",
    tipoEntidade: "COLETIVO",
    ativo: true,
    codigo: "",
    nif: "",
    email: "",
    telefone: "",
    morada: "",
    ilha: "SANTIAGO",
    conselho: "PRAIA",
    freguesia: "",
    localidade: "",
  };
}

// ── Cliente Modal ─────────────────────────────────────────────

function ClienteModal({
  cliente,
  onClose,
}: {
  cliente: Cliente | null;
  onClose: () => void;
}) {
  const criar = useCriarCliente();
  const atualizar = useAtualizarCliente();
  const isEditing = !!cliente?.id;

  const [form, setForm] = useState<
    Omit<
      Cliente,
      "id" | "createdAt" | "updatedAt" | "createdBy" | "lastModifiedBy"
    >
  >(
    cliente
      ? {
          nome: cliente.nome,
          tipoEntidade: cliente.tipoEntidade,
          ativo: cliente.ativo,
          codigo: cliente.codigo ?? "",
          nif: cliente.nif ?? "",
          email: cliente.email ?? "",
          telefone: cliente.telefone ?? "",
          pessoaContacto: cliente.pessoaContacto ?? "",
          morada: cliente.morada ?? "",
          endereco: cliente.endereco ?? "",
          ilha: cliente.ilha ?? "SANTIAGO",
          conselho: cliente.conselho ?? "PRAIA",
          freguesia: cliente.freguesia ?? "",
          localidade: cliente.localidade ?? "",
          descricao: cliente.descricao ?? "",
          aplicarImpostos: cliente.aplicarImpostos ?? false,
          enquadramento: cliente.enquadramento ?? "",
        }
      : emptyCliente(),
  );

  const saving = criar.isPending || atualizar.isPending;

  async function handleSave() {
    if (isEditing && cliente?.id) {
      await atualizar.mutateAsync({ id: cliente.id, data: form });
    } else {
      await criar.mutateAsync(form);
    }
    onClose();
  }

  const conselhos = CONSELHOS[form.ilha ?? "SANTIAGO"] ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-800">
            {isEditing ? `Editar #${cliente?.nome}` : "Novo Cliente"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Top row: Foto + main fields */}
          <div className="flex gap-5">
            {/* Foto */}
            <div className="flex flex-col items-center gap-2">
              <div className="h-28 w-28 rounded border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-2xl text-gray-300 font-bold">
                Foto
              </div>
              <button className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-3.5 w-3.5"
                >
                  <path d="M3 9l1.5-1.5A2 2 0 016 7h8a2 2 0 011.5.5L17 9M3 9v7a1 1 0 001 1h12a1 1 0 001-1V9M10 12a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
                Selecione a Photo
              </button>
            </div>

            {/* Fields */}
            <div className="flex-1 grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">
                  Código <span className="text-red-400">*</span>
                </label>
                <input
                  disabled
                  value={form.codigo ?? ""}
                  className="h-8 rounded border border-gray-200 bg-gray-50 px-2.5 text-xs text-gray-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">NIF</label>
                <div className="flex gap-1">
                  <input
                    value={form.nif ?? ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, nif: e.target.value }))
                    }
                    className="h-8 flex-1 rounded border border-gray-300 bg-white px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  <button className="rounded bg-blue-600 px-2.5 text-xs font-medium text-white hover:bg-blue-700 whitespace-nowrap">
                    Validar
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">
                  Tipo Cliente <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.tipoEntidade}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      tipoEntidade: e.target.value as TipoEntidade,
                    }))
                  }
                  className="h-8 rounded border border-gray-300 bg-white px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  {TIPOS_ENTIDADE.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-xs text-gray-500">
                  Nome <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.nome}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, nome: e.target.value }))
                  }
                  className="h-8 rounded border border-gray-300 bg-white px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Telemóvel</label>
                <input
                  type="tel"
                  value={form.telefone ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, telefone: e.target.value }))
                  }
                  placeholder="Telefone..."
                  className="h-8 rounded border border-gray-300 bg-white px-2.5 text-xs placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Email</label>
            <input
              type="email"
              value={form.email ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              className="h-8 rounded border border-gray-300 bg-white px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* Pessoa de Contacto */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Pessoa de Contacto</label>
            <input
              value={form.pessoaContacto ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, pessoaContacto: e.target.value }))
              }
              placeholder="Informações de pessoa de contacto..."
              className="h-8 rounded border border-gray-300 bg-white px-2.5 text-xs placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* Descrição */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Descrição</label>
            <textarea
              value={form.descricao ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, descricao: e.target.value }))
              }
              placeholder="Descr..."
              rows={2}
              className="rounded border border-gray-300 bg-white px-2.5 py-2 text-xs placeholder:text-gray-300 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* Localidade/Morada */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-3.5 w-3.5 text-gray-400"
              >
                <circle cx="10" cy="8" r="3" />
                <path d="M10 2C6.13 2 3 5.13 3 9c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7z" />
              </svg>
              <span className="text-xs font-semibold text-gray-600">
                Localidade/Morada
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Ilha</label>
                <select
                  value={form.ilha ?? "SANTIAGO"}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      ilha: e.target.value,
                      conselho: "",
                    }))
                  }
                  className="h-8 rounded border border-gray-300 bg-white px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  {ILHAS.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Conselho</label>
                <select
                  value={form.conselho ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, conselho: e.target.value }))
                  }
                  className="h-8 rounded border border-gray-300 bg-white px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  <option value=""></option>
                  {conselhos.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Freguesia</label>
                <input
                  value={form.freguesia ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, freguesia: e.target.value }))
                  }
                  className="h-8 rounded border border-gray-300 bg-white px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Localidade</label>
                <input
                  value={form.localidade ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, localidade: e.target.value }))
                  }
                  className="h-8 rounded border border-gray-300 bg-white px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">
              Endereço <span className="text-red-400">*</span>
            </label>
            <input
              value={form.endereco ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, endereco: e.target.value }))
              }
              className="h-8 rounded border border-gray-300 bg-white px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded border border-gray-300 px-5 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
          >
            Fechar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded bg-indigo-600 px-6 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "A guardar…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Fornecedor Modal ──────────────────────────────────────────

function FornecedorModal({
  fornecedor,
  onClose,
}: {
  fornecedor: Fornecedor | null;
  onClose: () => void;
}) {
  const criar = useCriarFornecedor();
  const atualizar = useAtualizarFornecedor();
  const isEditing = !!fornecedor?.id;

  const [form, setForm] = useState<
    Omit<
      Fornecedor,
      "id" | "createdAt" | "updatedAt" | "createdBy" | "lastModifiedBy"
    >
  >(
    fornecedor
      ? {
          nome: fornecedor.nome,
          tipoEntidade: fornecedor.tipoEntidade,
          ativo: fornecedor.ativo,
          codigo: fornecedor.codigo ?? "",
          nif: fornecedor.nif ?? "",
          email: fornecedor.email ?? "",
          telefone: fornecedor.telefone ?? "",
          morada: fornecedor.morada ?? "",
          ilha: fornecedor.ilha ?? "SANTIAGO",
          conselho: fornecedor.conselho ?? "PRAIA",
          freguesia: fornecedor.freguesia ?? "",
          localidade: fornecedor.localidade ?? "",
        }
      : emptyFornecedor(),
  );

  const saving = criar.isPending || atualizar.isPending;

  async function handleSave() {
    if (isEditing && fornecedor?.id) {
      await atualizar.mutateAsync({ id: fornecedor.id, data: form });
    } else {
      await criar.mutateAsync(form);
    }
    onClose();
  }

  const conselhos = CONSELHOS[form.ilha ?? "SANTIAGO"] ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-800">
            {isEditing ? `Editar #${fornecedor?.nome}` : "Novo Fornecedor"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex gap-5">
            {/* Foto */}
            <div className="flex flex-col items-center gap-2">
              <div className="h-28 w-28 rounded border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-2xl text-gray-300 font-bold">
                Foto
              </div>
              <button className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-3.5 w-3.5"
                >
                  <path d="M3 9l1.5-1.5A2 2 0 016 7h8a2 2 0 011.5.5L17 9M3 9v7a1 1 0 001 1h12a1 1 0 001-1V9M10 12a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
                Selecione a Photo
              </button>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">
                  Código <span className="text-red-400">*</span>
                </label>
                <input
                  disabled
                  value={form.codigo ?? ""}
                  className="h-8 rounded border border-gray-200 bg-gray-50 px-2.5 text-xs text-gray-500"
                />
              </div>
              <div className="flex flex-col gap-1 col-span-1">
                <label className="text-xs text-gray-500">
                  Nome <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.nome}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, nome: e.target.value }))
                  }
                  className="h-8 rounded border border-gray-300 bg-white px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Email</label>
                <input
                  type="email"
                  value={form.email ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                  className="h-8 rounded border border-gray-300 bg-white px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Telefone</label>
                <input
                  type="tel"
                  value={form.telefone ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, telefone: e.target.value }))
                  }
                  className="h-8 rounded border border-gray-300 bg-white px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">
                  NIF <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.nif ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, nif: e.target.value }))
                  }
                  className="h-8 rounded border border-gray-300 bg-white px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Tipo</label>
                <select
                  value={form.tipoEntidade}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      tipoEntidade: e.target.value as TipoEntidade,
                    }))
                  }
                  className="h-8 rounded border border-gray-300 bg-white px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  {TIPOS_ENTIDADE.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Endereço</label>
            <input
              value={form.morada ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, morada: e.target.value }))
              }
              className="h-8 rounded border border-gray-300 bg-white px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* Localidade/Morada */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-3.5 w-3.5 text-gray-400"
              >
                <circle cx="10" cy="8" r="3" />
                <path d="M10 2C6.13 2 3 5.13 3 9c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7z" />
              </svg>
              <span className="text-xs font-semibold text-gray-600">
                Localidade/Morada
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Ilha</label>
                <select
                  value={form.ilha ?? "SANTIAGO"}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      ilha: e.target.value,
                      conselho: "",
                    }))
                  }
                  className="h-8 rounded border border-gray-300 bg-white px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  {ILHAS.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Conselho</label>
                <select
                  value={form.conselho ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, conselho: e.target.value }))
                  }
                  className="h-8 rounded border border-gray-300 bg-white px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  <option value=""></option>
                  {conselhos.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Freguesia</label>
                <input
                  value={form.freguesia ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, freguesia: e.target.value }))
                  }
                  className="h-8 rounded border border-gray-300 bg-white px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Localidade</label>
                <input
                  value={form.localidade ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, localidade: e.target.value }))
                  }
                  className="h-8 rounded border border-gray-300 bg-white px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded border border-gray-300 px-5 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
          >
            Fechar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded bg-indigo-600 px-6 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "A guardar…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Clientes Table ────────────────────────────────────────────

function ClientesTab() {
  const { data, isLoading } = useClientes(0, 50);
  const clientes = data?.content ?? [];
  const [modal, setModal] = useState<Cliente | null | "new">(null);

  return (
    <div className="space-y-4">
      {modal !== null && (
        <ClienteModal
          cliente={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Clientes</h2>
        <button
          onClick={() => setModal("new")}
          className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
        >
          <span className="text-base leading-none">+</span> Novo Cliente
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-gray-400">
            A carregar…
          </div>
        ) : clientes.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">
            Nenhum cliente encontrado
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="w-10 px-3 py-2.5 text-center font-medium text-gray-500">
                  #
                </th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">
                  Código
                </th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">
                  Nome
                </th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">
                  NIF
                </th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">
                  Email
                </th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">
                  Telefone
                </th>
                <th className="px-3 py-2.5 text-center font-medium text-gray-600">
                  Tipo
                </th>
                <th className="px-3 py-2.5 text-center font-medium text-gray-600">
                  Estado
                </th>
                <th className="px-3 py-2.5 text-center font-medium text-gray-600">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clientes.map((c, idx) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 text-center text-xs text-gray-400">
                    {idx + 1}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs text-gray-700">
                    {c.codigo ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 font-medium text-gray-800">
                    {c.nome}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-600">
                    {c.nif ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-600">
                    {c.email ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-600">
                    {c.telefone ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="inline-flex rounded px-2 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-600">
                      {c.tipoEntidade === "COLETIVO" ? "Coletivo" : "Singular"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        c.ativo
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {c.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <button
                      onClick={() => setModal(c)}
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

// ── Fornecedores Table ────────────────────────────────────────

function FornecedoresTab() {
  const { data, isLoading } = useFornecedores(0, 50);
  const fornecedores = data?.content ?? [];
  const [modal, setModal] = useState<Fornecedor | null | "new">(null);

  return (
    <div className="space-y-4">
      {modal !== null && (
        <FornecedorModal
          fornecedor={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Fornecedores</h2>
        <button
          onClick={() => setModal("new")}
          className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
        >
          <span className="text-base leading-none">+</span> Novo Fornecedor
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-gray-400">
            A carregar…
          </div>
        ) : fornecedores.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">
            Nenhum fornecedor encontrado
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="w-10 px-3 py-2.5 text-center font-medium text-gray-500">
                  #
                </th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">
                  Código
                </th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">
                  Nome
                </th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">
                  NIF
                </th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">
                  Email
                </th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-600">
                  Telefone
                </th>
                <th className="px-3 py-2.5 text-center font-medium text-gray-600">
                  Estado
                </th>
                <th className="px-3 py-2.5 text-center font-medium text-gray-600">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fornecedores.map((f, idx) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 text-center text-xs text-gray-400">
                    {idx + 1}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs text-gray-700">
                    {f.codigo ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 font-medium text-gray-800">
                    {f.nome}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-600">
                    {f.nif ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-600">
                    {f.email ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-600">
                    {f.telefone ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        f.ativo
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {f.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <button
                      onClick={() => setModal(f)}
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

// ── Page ─────────────────────────────────────────────────────

export default function CadastroPage() {
  const [tab, setTab] = useState<Tab>("clientes");

  return (
    <div className="flex flex-col gap-0 p-0">
      <div className="border-b border-gray-200 bg-white px-6 py-2.5">
        <nav className="flex items-center gap-1 text-xs text-gray-500">
          <a href="/" className="hover:text-gray-700">
            Página Inicial
          </a>
          <span>/</span>
          <span className="text-gray-700 font-medium">Cadastro</span>
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
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
              </svg>
              <h1 className="text-sm font-semibold text-gray-800">Cadastro</h1>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50 px-5">
            {(["clientes", "fornecedores"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                  tab === t
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t === "clientes" ? "Clientes" : "Fornecedores"}
              </button>
            ))}
          </div>

          <div className="p-5">
            {tab === "clientes" ? <ClientesTab /> : <FornecedoresTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
