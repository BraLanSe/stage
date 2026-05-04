/* IGRP-GENERATED-PAGE */
"use client";

/* IGRP-CUSTOM-CODE-BEGIN(imports) */
import {
  IGRPButton,
  IGRPCard,
  IGRPCardContent,
  IGRPContainer,
  IGRPInputText,
  IGRPPageHeader,
  IGRPTable,
  IGRPTabs,
} from "@igrp/igrp-framework-react-design-system";
import { useState } from "react";
import type { Cliente, CVE, Fornecedor, Produto } from "@/app/(myapp)/types/efatura";
import {
  useClientes,
  useFornecedores,
  useProdutos,
} from "@/hooks/use-cadastro";
import { ClienteModal } from "./components/ClienteModal";
import { FornecedorModal } from "./components/FornecedorModal";
import { ProdutoModal } from "./components/ProdutoModal";
import { formatCVE } from "./components/shared";
/* IGRP-CUSTOM-CODE-END */

// ── Tab Skeleton ──────────────────────────────────────────────

function TabSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-0 rounded border border-gray-100 overflow-hidden">
      <div className="grid grid-cols-7 gap-3 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="h-3 rounded bg-gray-200" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="grid grid-cols-7 gap-3 border-b border-gray-100 px-4 py-3 last:border-0">
          {Array.from({ length: 7 }, (_, j) => (
            <div key={j} className="h-3 rounded bg-gray-200" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      ))}
    </div>
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
          iconName="Plus"
          onClick={() => setModal("new")}
        >
          Novo Cliente
        </IGRPButton>
      </div>

      {isLoading ? (
        <TabSkeleton />
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
          iconName="Plus"
          onClick={() => setModal("new")}
        >
          Novo Fornecedor
        </IGRPButton>
      </div>

      {isLoading ? (
        <TabSkeleton />
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
            iconName="Search"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <IGRPButton
            name="novo-produto"
            tag="btn-novo-produto"
            showIcon
            iconName="Plus"
            onClick={() => setModal("new")}
          >
            Novo Produto
          </IGRPButton>
        </div>
      </div>

      {isLoading ? (
        <TabSkeleton />
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
              render: (v) => (v != null ? `${v}%` : "—"),
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
      <IGRPButton name="force-studio" tag="force-studio" id="force-studio">FORCE</IGRPButton>
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
