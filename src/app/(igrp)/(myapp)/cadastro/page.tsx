/* IGRP-GENERATED-PAGE */
"use client";

/* IGRP-CUSTOM-CODE-BEGIN(imports) */
import {
  IGRPButton,
  IGRPCard,
  IGRPCardContent,
  IGRPCheckbox,
  IGRPContainer,
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

const TIPOS_ENTIDADE: { value: TipoEntidade; label: string }[] = [
  { value: "SINGULAR", label: "Singular" },
  { value: "COLETIVO", label: "Coletivo" },
];
/* IGRP-CUSTOM-CODE-END */

/* IGRP-CUSTOM-CODE-BEGIN(helpers) */
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
/* IGRP-CUSTOM-CODE-END */

// ── Cliente Modal ─────────────────────────────────────────────

function ClienteModal({
  cliente,
  onClose,
}: {
  cliente: Cliente | null;
  onClose: () => void;
}) {
  /* IGRP-CUSTOM-CODE-BEGIN(cliente-modal-hooks) */
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
  /* IGRP-CUSTOM-CODE-END */

  return (
    <IGRPModalDialog open onOpenChange={(o) => !o && onClose()}>
      <IGRPModalDialogContent size="lg">
        <IGRPModalDialogHeader>
          <IGRPModalDialogTitle
            name="modal-cliente-title"
            tag="modal-cliente-title"
          >
            {isEditing ? `Editar — ${cliente?.desig}` : "Novo Cliente"}
          </IGRPModalDialogTitle>
        </IGRPModalDialogHeader>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-3">
            <IGRPInputText
              name="codigo"
              tag="input-cliente-codigo"
              label="Código"
              disabled
              value={form.codigo ?? ""}
            />
            <IGRPInputText
              name="nif"
              tag="input-cliente-nif"
              label="NIF"
              value={form.nif ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, nif: e.target.value }))
              }
            />
            <IGRPSelect
              name="tipoEntidade"
              tag="select-cliente-tipoEntidade"
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
                tag="input-cliente-nome"
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
              tag="input-cliente-telefone"
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
            tag="input-cliente-email"
            label="Email"
            type="email"
            value={form.email ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, email: e.target.value }))
            }
          />

          <IGRPInputText
            name="pessoaContacto"
            tag="input-cliente-pessoaContacto"
            label="Pessoa de Contacto"
            placeholder="Informações de pessoa de contacto..."
            value={form.pessoaContacto ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, pessoaContacto: e.target.value }))
            }
          />

          <IGRPTextarea
            name="descricao"
            tag="textarea-cliente-descricao"
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
              tag="select-cliente-ilha"
              label="Ilha"
              options={ILHAS.map((i) => ({ label: i, value: i }))}
              value={form.ilha ?? "SANTIAGO"}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, ilha: v, conselho: "" }))
              }
            />
            <IGRPSelect
              name="conselho"
              tag="select-cliente-conselho"
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
              tag="input-cliente-freguesia"
              label="Freguesia"
              value={form.freguesia ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, freguesia: e.target.value }))
              }
            />
            <IGRPInputText
              name="localidade"
              tag="input-cliente-localidade"
              label="Localidade"
              value={form.localidade ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, localidade: e.target.value }))
              }
            />
          </div>

          <IGRPInputText
            name="endereco"
            tag="input-cliente-endereco"
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
            tag="btn-fechar-cliente"
            variant="outline"
            onClick={onClose}
          >
            Fechar
          </IGRPButton>
          <IGRPButton
            name="guardar-cliente"
            tag="btn-guardar-cliente"
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
  /* IGRP-CUSTOM-CODE-BEGIN(fornecedor-modal-hooks) */
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
  /* IGRP-CUSTOM-CODE-END */

  return (
    <IGRPModalDialog open onOpenChange={(o) => !o && onClose()}>
      <IGRPModalDialogContent size="lg">
        <IGRPModalDialogHeader>
          <IGRPModalDialogTitle
            name="modal-fornecedor-title"
            tag="modal-fornecedor-title"
          >
            {isEditing ? `Editar — ${fornecedor?.desig}` : "Novo Fornecedor"}
          </IGRPModalDialogTitle>
        </IGRPModalDialogHeader>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <IGRPInputText
              name="codigo"
              tag="input-fornecedor-codigo"
              label="Código"
              disabled
              value={form.codigo ?? ""}
            />
            <IGRPInputText
              name="desig"
              tag="input-fornecedor-nome"
              label="Nome"
              required
              value={form.desig}
              onChange={(e) =>
                setForm((p) => ({ ...p, desig: e.target.value }))
              }
            />
            <IGRPInputText
              name="email"
              tag="input-fornecedor-email"
              label="Email"
              type="email"
              value={form.email ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
            />
            <IGRPInputText
              name="telefone"
              tag="input-fornecedor-telefone"
              label="Telefone"
              value={form.telefone ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, telefone: e.target.value }))
              }
            />
            <IGRPInputText
              name="nif"
              tag="input-fornecedor-nif"
              label="NIF"
              required
              value={form.nif ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, nif: e.target.value }))
              }
            />
            <IGRPSelect
              name="tipoEntidade"
              tag="select-fornecedor-tipoEntidade"
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
            tag="input-fornecedor-morada"
            label="Endereço"
            value={form.morada ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, morada: e.target.value }))
            }
          />

          <div className="grid grid-cols-4 gap-3">
            <IGRPSelect
              name="ilha"
              tag="select-fornecedor-ilha"
              label="Ilha"
              options={ILHAS.map((i) => ({ label: i, value: i }))}
              value={form.ilha ?? "SANTIAGO"}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, ilha: v, conselho: "" }))
              }
            />
            <IGRPSelect
              name="conselho"
              tag="select-fornecedor-conselho"
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
              tag="input-fornecedor-freguesia"
              label="Freguesia"
              value={form.freguesia ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, freguesia: e.target.value }))
              }
            />
            <IGRPInputText
              name="localidade"
              tag="input-fornecedor-localidade"
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
            tag="btn-fechar-fornecedor"
            variant="outline"
            onClick={onClose}
          >
            Fechar
          </IGRPButton>
          <IGRPButton
            name="guardar-fornecedor"
            tag="btn-guardar-fornecedor"
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
  /* IGRP-CUSTOM-CODE-BEGIN(produto-modal-hooks) */
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
  /* IGRP-CUSTOM-CODE-END */

  return (
    <IGRPModalDialog open onOpenChange={(o) => !o && onClose()}>
      <IGRPModalDialogContent size="md">
        <IGRPModalDialogHeader>
          <IGRPModalDialogTitle
            name="modal-produto-title"
            tag="modal-produto-title"
          >
            {isEditing ? `Editar — ${produto?.desig}` : "Novo Produto / Serviço"}
          </IGRPModalDialogTitle>
        </IGRPModalDialogHeader>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <IGRPInputText
              name="codigo"
              tag="input-produto-codigo"
              label="Código"
              disabled
              value={form.codigo}
            />
            <div className="col-span-2">
              <IGRPInputText
                name="desig"
                tag="input-produto-desig"
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
            tag="textarea-produto-descr"
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
              tag="input-produto-preco"
              label="Preço Unitário (CVE)"
              min={0}
              step={0.01}
              value={form.preco ?? 0}
              onChange={(v) => setForm((p) => ({ ...p, preco: v }))}
            />
            <IGRPInputNumber
              name="percentagemIva"
              tag="input-produto-percentagemIva"
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
              tag="input-produto-unidade"
              label="Unidade"
              placeholder="Ex: un, kg, m²"
              value={form.unidade ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, unidade: e.target.value }))
              }
            />
            <IGRPInputText
              name="categoria"
              tag="input-produto-categoria"
              label="Categoria"
              value={form.categoria ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, categoria: e.target.value }))
              }
            />
          </div>

          <IGRPCheckbox
            name="ativo"
            tag="checkbox-produto-ativo"
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
            tag="btn-cancelar-produto"
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </IGRPButton>
          <IGRPButton
            name="guardar-produto"
            tag="btn-guardar-produto"
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
  /* IGRP-CUSTOM-CODE-BEGIN(clientes-tab-hooks) */
  const { data, isLoading } = useClientes(0, 50);
  const clientes = data?.content ?? [];
  const [modal, setModal] = useState<Cliente | null | "new">(null);
  /* IGRP-CUSTOM-CODE-END */

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
          tag="btn-novo-cliente"
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
          tag="table-clientes"
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
              tag="btn-editar-cliente"
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
  /* IGRP-CUSTOM-CODE-BEGIN(fornecedores-tab-hooks) */
  const { data, isLoading } = useFornecedores(0, 50);
  const fornecedores = data?.content ?? [];
  const [modal, setModal] = useState<Fornecedor | null | "new">(null);
  /* IGRP-CUSTOM-CODE-END */

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
          tag="btn-novo-fornecedor"
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
          tag="table-fornecedores"
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
              tag="btn-editar-fornecedor"
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
  /* IGRP-CUSTOM-CODE-BEGIN(produtos-tab-hooks) */
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
  /* IGRP-CUSTOM-CODE-END */

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
            tag="input-search-produto"
            placeholder="Pesquisar…"
            showIcon
            iconName="search"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <IGRPButton
            name="novo-produto"
            tag="btn-novo-produto"
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
          tag="table-produtos"
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
              tag="btn-editar-produto"
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
  /* IGRP-CUSTOM-CODE-BEGIN(page-hooks) */
  const { data: clientesData } = useClientes(0, 1);
  const { data: fornecedoresData } = useFornecedores(0, 1);
  const { data: produtosData } = useProdutos(0, 1);
  const totalClientes = (clientesData as { totalElements?: number } | undefined)?.totalElements ?? clientesData?.content?.length ?? 0;
  const totalFornecedores = (fornecedoresData as { totalElements?: number } | undefined)?.totalElements ?? fornecedoresData?.content?.length ?? 0;
  const totalProdutos = (produtosData as { totalElements?: number } | undefined)?.totalElements ?? produtosData?.content?.length ?? 0;
  /* IGRP-CUSTOM-CODE-END */

  return (
    <IGRPContainer
      id="cadastro"
      name="cadastro"
      tag="cadastro"
      className="flex flex-col gap-0 p-0 bg-[#f7f9fc]"
    >
      <IGRPPageHeader
        name="cadastro-header"
        tag="cadastro-header"
        title="Cadastro"
        description="Gestão de clientes, fornecedores e produtos"
        className="border-b px-6 py-3 bg-white"
      />

      <div className="p-5 flex flex-col gap-5">
        {/* Summary Strip */}
        <div className="grid grid-cols-3 gap-4">
          <IGRPCard name="card-total-clientes" tag="card-total-clientes" className="rounded-2xl shadow-[0_2px_12px_rgba(53,121,246,0.07)] border border-slate-100">
            <IGRPCardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#3579f6]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[#3579f6] text-sm font-bold">CLI</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-800">{totalClientes}</p>
              </div>
            </IGRPCardContent>
          </IGRPCard>
          <IGRPCard name="card-total-fornecedores" tag="card-total-fornecedores" className="rounded-2xl shadow-[0_2px_12px_rgba(53,121,246,0.07)] border border-slate-100">
            <IGRPCardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#3579f6]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[#3579f6] text-sm font-bold">FOR</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Fornecedores</p>
                <p className="text-2xl font-bold text-gray-800">{totalFornecedores}</p>
              </div>
            </IGRPCardContent>
          </IGRPCard>
          <IGRPCard name="card-total-produtos" tag="card-total-produtos" className="rounded-2xl shadow-[0_2px_12px_rgba(53,121,246,0.07)] border border-slate-100">
            <IGRPCardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#3579f6]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[#3579f6] text-sm font-bold">PRD</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Produtos</p>
                <p className="text-2xl font-bold text-gray-800">{totalProdutos}</p>
              </div>
            </IGRPCardContent>
          </IGRPCard>
        </div>

        <IGRPCard name="card-tabs-cadastro" tag="card-tabs-cadastro" className="rounded-2xl shadow-[0_2px_12px_rgba(53,121,246,0.07)] border border-slate-100">
          <IGRPCardContent className="p-5">
            <IGRPTabs
              name="cadastro-tabs"
              tag="tabs-cadastro"
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
          </IGRPCardContent>
        </IGRPCard>
      </div>
    </IGRPContainer>
  );
}
