"use client";

import {
  IGRPButton,
  IGRPCheckbox,
  IGRPInputNumber,
  IGRPInputText,
  IGRPModalDialog,
  IGRPModalDialogContent,
  IGRPModalDialogFooter,
  IGRPModalDialogHeader,
  IGRPModalDialogTitle,
  IGRPPageHeader,
  IGRPSelect,
  IGRPTable,
  IGRPTabs,
  IGRPTextarea,
} from "@igrp/igrp-framework-react-design-system";
import { useState } from "react";
import type {
  Cliente,
  CVE,
  Fornecedor,
  Produto,
  TipoEntidade,
} from "@/app/(myapp)/types/efatura";
import {
  useAtualizarCliente,
  useAtualizarFornecedor,
  useAtualizarProduto,
  useClientes,
  useCriarCliente,
  useCriarFornecedor,
  useCriarProduto,
  useFornecedores,
  useProdutos,
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

function formatCVE(v: CVE | undefined | null) {
  if (v == null || Number.isNaN(v)) return "—";
  return new Intl.NumberFormat("pt-CV", {
    style: "currency",
    currency: "CVE",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

function emptyCliente(): Omit<
  Cliente,
  "id" | "createdAt" | "updatedAt" | "createdBy" | "lastModifiedBy"
> {
  return {
    desig: "",
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
    desig: "",
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

function emptyProduto(): Omit<
  Produto,
  "id" | "createdAt" | "updatedAt" | "createdBy" | "lastModifiedBy"
> {
  return {
    codigo: "",
    desig: "",
    descr: "",
    preco: 0,
    unidade: "",
    categoria: "",
    percentagemIva: 15,
    ativo: true,
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
          desig: cliente.desig,
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
  const conselhos = CONSELHOS[form.ilha ?? "SANTIAGO"] ?? [];

  async function handleSave() {
    if (isEditing && cliente?.id) {
      await atualizar.mutateAsync({ id: cliente.id, data: form });
    } else {
      await criar.mutateAsync(form);
    }
    onClose();
  }

  return (
    <IGRPModalDialog open onOpenChange={(o) => !o && onClose()}>
      <IGRPModalDialogContent size="lg">
        <IGRPModalDialogHeader>
          <IGRPModalDialogTitle name="modal-cliente-title">
            {isEditing ? `Editar — ${cliente?.desig}` : "Novo Cliente"}
          </IGRPModalDialogTitle>
        </IGRPModalDialogHeader>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-3">
            <IGRPInputText
              name="codigo"
              label="Código"
              disabled
              value={form.codigo ?? ""}
            />
            <IGRPInputText
              name="nif"
              label="NIF"
              value={form.nif ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, nif: e.target.value }))
              }
            />
            <IGRPSelect
              name="tipoEntidade"
              label="Tipo Cliente"
              required
              options={TIPOS_ENTIDADE.map((t) => ({
                label: t.label,
                value: t.value,
              }))}
              value={form.tipoEntidade}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, tipoEntidade: v as TipoEntidade }))
              }
            />
            <div className="col-span-2">
              <IGRPInputText
                name="nome"
                label="Nome"
                required
                value={form.desig}
                onChange={(e) =>
                  setForm((p) => ({ ...p, desig: e.target.value }))
                }
              />
            </div>
            <IGRPInputText
              name="telefone"
              label="Telemóvel"
              placeholder="Telefone..."
              value={form.telefone ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, telefone: e.target.value }))
              }
            />
          </div>

          <IGRPInputText
            name="email"
            label="Email"
            type="email"
            value={form.email ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, email: e.target.value }))
            }
          />

          <IGRPInputText
            name="pessoaContacto"
            label="Pessoa de Contacto"
            placeholder="Informações de pessoa de contacto..."
            value={form.pessoaContacto ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, pessoaContacto: e.target.value }))
            }
          />

          <IGRPTextarea
            name="descricao"
            label="Descrição"
            placeholder="Descr..."
            rows={2}
            value={form.descricao ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, descricao: e.target.value }))
            }
          />

          <div className="grid grid-cols-4 gap-3">
            <IGRPSelect
              name="ilha"
              label="Ilha"
              options={ILHAS.map((i) => ({ label: i, value: i }))}
              value={form.ilha ?? "SANTIAGO"}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, ilha: v, conselho: "" }))
              }
            />
            <IGRPSelect
              name="conselho"
              label="Conselho"
              options={[
                { label: "—", value: "" },
                ...conselhos.map((c) => ({ label: c, value: c })),
              ]}
              value={form.conselho ?? ""}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, conselho: v }))
              }
            />
            <IGRPInputText
              name="freguesia"
              label="Freguesia"
              value={form.freguesia ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, freguesia: e.target.value }))
              }
            />
            <IGRPInputText
              name="localidade"
              label="Localidade"
              value={form.localidade ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, localidade: e.target.value }))
              }
            />
          </div>

          <IGRPInputText
            name="endereco"
            label="Endereço"
            required
            value={form.endereco ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, endereco: e.target.value }))
            }
          />
        </div>

        <IGRPModalDialogFooter>
          <IGRPButton
            name="fechar-cliente"
            variant="outline"
            onClick={onClose}
          >
            Fechar
          </IGRPButton>
          <IGRPButton
            name="guardar-cliente"
            loading={saving}
            loadingText="A guardar…"
            onClick={handleSave}
          >
            Guardar
          </IGRPButton>
        </IGRPModalDialogFooter>
      </IGRPModalDialogContent>
    </IGRPModalDialog>
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
          desig: fornecedor.desig,
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
  const conselhos = CONSELHOS[form.ilha ?? "SANTIAGO"] ?? [];

  async function handleSave() {
    if (isEditing && fornecedor?.id) {
      await atualizar.mutateAsync({ id: fornecedor.id, data: form });
    } else {
      await criar.mutateAsync(form);
    }
    onClose();
  }

  return (
    <IGRPModalDialog open onOpenChange={(o) => !o && onClose()}>
      <IGRPModalDialogContent size="lg">
        <IGRPModalDialogHeader>
          <IGRPModalDialogTitle name="modal-fornecedor-title">
            {isEditing ? `Editar — ${fornecedor?.desig}` : "Novo Fornecedor"}
          </IGRPModalDialogTitle>
        </IGRPModalDialogHeader>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <IGRPInputText
              name="codigo"
              label="Código"
              disabled
              value={form.codigo ?? ""}
            />
            <IGRPInputText
              name="desig"
              label="Nome"
              required
              value={form.desig}
              onChange={(e) =>
                setForm((p) => ({ ...p, desig: e.target.value }))
              }
            />
            <IGRPInputText
              name="email"
              label="Email"
              type="email"
              value={form.email ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
            />
            <IGRPInputText
              name="telefone"
              label="Telefone"
              value={form.telefone ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, telefone: e.target.value }))
              }
            />
            <IGRPInputText
              name="nif"
              label="NIF"
              required
              value={form.nif ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, nif: e.target.value }))
              }
            />
            <IGRPSelect
              name="tipoEntidade"
              label="Tipo"
              options={TIPOS_ENTIDADE.map((t) => ({
                label: t.label,
                value: t.value,
              }))}
              value={form.tipoEntidade}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, tipoEntidade: v as TipoEntidade }))
              }
            />
          </div>

          <IGRPInputText
            name="morada"
            label="Endereço"
            value={form.morada ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, morada: e.target.value }))
            }
          />

          <div className="grid grid-cols-4 gap-3">
            <IGRPSelect
              name="ilha"
              label="Ilha"
              options={ILHAS.map((i) => ({ label: i, value: i }))}
              value={form.ilha ?? "SANTIAGO"}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, ilha: v, conselho: "" }))
              }
            />
            <IGRPSelect
              name="conselho"
              label="Conselho"
              options={[
                { label: "—", value: "" },
                ...conselhos.map((c) => ({ label: c, value: c })),
              ]}
              value={form.conselho ?? ""}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, conselho: v }))
              }
            />
            <IGRPInputText
              name="freguesia"
              label="Freguesia"
              value={form.freguesia ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, freguesia: e.target.value }))
              }
            />
            <IGRPInputText
              name="localidade"
              label="Localidade"
              value={form.localidade ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, localidade: e.target.value }))
              }
            />
          </div>
        </div>

        <IGRPModalDialogFooter>
          <IGRPButton
            name="fechar-fornecedor"
            variant="outline"
            onClick={onClose}
          >
            Fechar
          </IGRPButton>
          <IGRPButton
            name="guardar-fornecedor"
            loading={saving}
            loadingText="A guardar…"
            onClick={handleSave}
          >
            Guardar
          </IGRPButton>
        </IGRPModalDialogFooter>
      </IGRPModalDialogContent>
    </IGRPModalDialog>
  );
}

// ── Produto Modal ─────────────────────────────────────────────

function ProdutoModal({
  produto,
  onClose,
}: {
  produto: Produto | null;
  onClose: () => void;
}) {
  const criar = useCriarProduto();
  const atualizar = useAtualizarProduto();
  const isEditing = !!produto?.id;

  const [form, setForm] = useState<
    Omit<Produto, "id" | "createdAt" | "updatedAt" | "createdBy" | "lastModifiedBy">
  >(
    produto
      ? {
          codigo: produto.codigo,
          desig: produto.desig,
          descr: produto.descr ?? "",
          preco: produto.preco ?? 0,
          unidade: produto.unidade ?? "",
          categoria: produto.categoria ?? "",
          percentagemIva: produto.percentagemIva ?? 15,
          ativo: produto.ativo,
        }
      : emptyProduto(),
  );

  const saving = criar.isPending || atualizar.isPending;

  async function handleSave() {
    if (isEditing && produto?.id) {
      await atualizar.mutateAsync({ id: produto.id, data: form });
    } else {
      await criar.mutateAsync(form);
    }
    onClose();
  }

  return (
    <IGRPModalDialog open onOpenChange={(o) => !o && onClose()}>
      <IGRPModalDialogContent size="md">
        <IGRPModalDialogHeader>
          <IGRPModalDialogTitle name="modal-produto-title">
            {isEditing ? `Editar — ${produto?.desig}` : "Novo Produto / Serviço"}
          </IGRPModalDialogTitle>
        </IGRPModalDialogHeader>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <IGRPInputText
              name="codigo"
              label="Código"
              disabled
              value={form.codigo}
            />
            <div className="col-span-2">
              <IGRPInputText
                name="desig"
                label="Designação"
                required
                value={form.desig}
                onChange={(e) =>
                  setForm((p) => ({ ...p, desig: e.target.value }))
                }
              />
            </div>
          </div>

          <IGRPTextarea
            name="descr"
            label="Descrição"
            rows={2}
            value={form.descr ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, descr: e.target.value }))
            }
          />

          <div className="grid grid-cols-2 gap-3">
            <IGRPInputNumber
              name="preco"
              label="Preço Unitário (CVE)"
              min={0}
              step={0.01}
              value={form.preco ?? 0}
              onChange={(v) => setForm((p) => ({ ...p, preco: v }))}
            />
            <IGRPInputNumber
              name="percentagemIva"
              label="IVA (%)"
              min={0}
              max={100}
              step={0.01}
              value={form.percentagemIva ?? 15}
              onChange={(v) =>
                setForm((p) => ({ ...p, percentagemIva: v }))
              }
            />
            <IGRPInputText
              name="unidade"
              label="Unidade"
              placeholder="Ex: un, kg, m²"
              value={form.unidade ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, unidade: e.target.value }))
              }
            />
            <IGRPInputText
              name="categoria"
              label="Categoria"
              value={form.categoria ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, categoria: e.target.value }))
              }
            />
          </div>

          <IGRPCheckbox
            name="ativo"
            label="Produto / Serviço ativo"
            checked={form.ativo}
            onCheckedChange={(checked) =>
              setForm((p) => ({ ...p, ativo: !!checked }))
            }
          />
        </div>

        <IGRPModalDialogFooter>
          <IGRPButton
            name="cancelar-produto"
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </IGRPButton>
          <IGRPButton
            name="guardar-produto"
            loading={saving}
            loadingText="A guardar…"
            disabled={!form.desig.trim()}
            onClick={handleSave}
          >
            {isEditing ? "Guardar" : "Criar"}
          </IGRPButton>
        </IGRPModalDialogFooter>
      </IGRPModalDialogContent>
    </IGRPModalDialog>
  );
}

// ── Clientes Tab ──────────────────────────────────────────────

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
        <h2 className="text-sm font-semibold">Clientes</h2>
        <IGRPButton
          name="novo-cliente"
          showIcon
          iconName="plus"
          onClick={() => setModal("new")}
        >
          Novo Cliente
        </IGRPButton>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          A carregar…
        </div>
      ) : (
        <IGRPTable
          id="clientes-table"
          content={clientes}
          columns={[
            {
              header: "Código",
              accessorKey: "codigo",
              render: (v) => String(v ?? "—"),
            },
            { header: "Nome", accessorKey: "desig" },
            {
              header: "NIF",
              accessorKey: "nif",
              render: (v) => String(v ?? "—"),
            },
            {
              header: "Email",
              accessorKey: "email",
              render: (v) => String(v ?? "—"),
            },
            {
              header: "Telefone",
              accessorKey: "telefone",
              render: (v) => String(v ?? "—"),
            },
            {
              header: "Tipo",
              accessorKey: "tipoEntidade",
              render: (v) =>
                (v as string) === "COLETIVO" ? "Coletivo" : "Singular",
            },
            {
              header: "Estado",
              accessorKey: "ativo",
              render: (v) => ((v as boolean) ? "Ativo" : "Inativo"),
            },
          ]}
          actions={(row) => (
            <IGRPButton
              name="editar-cliente"
              variant="ghost"
              size="sm"
              onClick={() => setModal(row.original)}
            >
              Editar
            </IGRPButton>
          )}
        />
      )}
    </div>
  );
}

// ── Fornecedores Tab ──────────────────────────────────────────

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
        <h2 className="text-sm font-semibold">Fornecedores</h2>
        <IGRPButton
          name="novo-fornecedor"
          showIcon
          iconName="plus"
          onClick={() => setModal("new")}
        >
          Novo Fornecedor
        </IGRPButton>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          A carregar…
        </div>
      ) : (
        <IGRPTable
          id="fornecedores-table"
          content={fornecedores}
          columns={[
            {
              header: "Código",
              accessorKey: "codigo",
              render: (v) => String(v ?? "—"),
            },
            { header: "Nome", accessorKey: "desig" },
            {
              header: "NIF",
              accessorKey: "nif",
              render: (v) => String(v ?? "—"),
            },
            {
              header: "Email",
              accessorKey: "email",
              render: (v) => String(v ?? "—"),
            },
            {
              header: "Telefone",
              accessorKey: "telefone",
              render: (v) => String(v ?? "—"),
            },
            {
              header: "Estado",
              accessorKey: "ativo",
              render: (v) => ((v as boolean) ? "Ativo" : "Inativo"),
            },
          ]}
          actions={(row) => (
            <IGRPButton
              name="editar-fornecedor"
              variant="ghost"
              size="sm"
              onClick={() => setModal(row.original)}
            >
              Editar
            </IGRPButton>
          )}
        />
      )}
    </div>
  );
}

// ── Produtos Tab ──────────────────────────────────────────────

function ProdutosTab() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data, isLoading } = useProdutos(0, 50, debouncedSearch || undefined);
  const produtos = data?.content ?? [];
  const [modal, setModal] = useState<Produto | null | "new">(null);

  function handleSearch(v: string) {
    setSearch(v);
    clearTimeout((handleSearch as { _t?: ReturnType<typeof setTimeout> })._t);
    (handleSearch as { _t?: ReturnType<typeof setTimeout> })._t = setTimeout(
      () => setDebouncedSearch(v),
      400,
    );
  }

  return (
    <div className="space-y-4">
      {modal !== null && (
        <ProdutoModal
          produto={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
        />
      )}

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Produtos / Serviços</h2>
        <div className="flex items-center gap-2">
          <IGRPInputText
            name="search-produto"
            placeholder="Pesquisar…"
            showIcon
            iconName="search"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <IGRPButton
            name="novo-produto"
            showIcon
            iconName="plus"
            onClick={() => setModal("new")}
          >
            Novo Produto
          </IGRPButton>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          A carregar…
        </div>
      ) : (
        <IGRPTable
          id="produtos-table"
          content={produtos}
          columns={[
            {
              header: "Código",
              accessorKey: "codigo",
              render: (v) => String(v || "—"),
            },
            { header: "Designação", accessorKey: "desig" },
            {
              header: "Categoria",
              accessorKey: "categoria",
              render: (v) => String(v || "—"),
            },
            {
              header: "Preço",
              accessorKey: "preco",
              render: (v) => formatCVE(v as CVE),
            },
            {
              header: "IVA",
              accessorKey: "percentagemIva",
              render: (v) =>
                v != null ? `${v}%` : "—",
            },
            {
              header: "Unidade",
              accessorKey: "unidade",
              render: (v) => String(v || "—"),
            },
            {
              header: "Estado",
              accessorKey: "ativo",
              render: (v) => ((v as boolean) ? "Ativo" : "Inativo"),
            },
          ]}
          actions={(row) => (
            <IGRPButton
              name="editar-produto"
              variant="ghost"
              size="sm"
              onClick={() => setModal(row.original)}
            >
              Editar
            </IGRPButton>
          )}
        />
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────

export default function CadastroPage() {
  return (
    <div className="flex flex-col gap-0 p-0">
      <IGRPPageHeader
        name="cadastro-header"
        title="Cadastro"
        description="Gestão de clientes, fornecedores e produtos"
        className="border-b px-6 py-3"
      />

      <div className="p-5">
        <IGRPTabs
          name="cadastro-tabs"
          defaultValue="clientes"
          variant="underline"
          items={[
            {
              value: "clientes",
              label: "Clientes",
              content: <ClientesTab />,
            },
            {
              value: "fornecedores",
              label: "Fornecedores",
              content: <FornecedoresTab />,
            },
            {
              value: "produtos",
              label: "Produtos / Serviços",
              content: <ProdutosTab />,
            },
          ]}
        />
      </div>
    </div>
  );
}
