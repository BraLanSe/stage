"use client";

import {
  IGRPButton,
  IGRPCard,
  IGRPCardContent,
  IGRPContainer,
  IGRPInputText,
  IGRPPageHeader,
  IGRPTable,
} from "@igrp/igrp-framework-react-design-system";
import { useState } from "react";
import type { Produto } from "@/app/(myapp)/types/efatura";
import { useProdutos } from "@/hooks/use-cadastro";
import { ProdutoModal } from "../cadastro/components/ProdutoModal";
import { formatCVE } from "../cadastro/components/shared";

export default function ProdutosVendidosPage() {
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
    <IGRPContainer
      id="produtos-vendidos"
      name="produtos-vendidos"
      tag="produtos-vendidos"
      className="flex flex-col gap-0 p-0 bg-[#f7f9fc]"
    >
      {modal !== null && (
        <ProdutoModal
          produto={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
        />
      )}

      <IGRPPageHeader
        name="produtos-vendidos-header"
        tag="produtos-vendidos-header"
        title="Produtos Vendidos"
        description="Catálogo de produtos e serviços disponíveis para venda"
        className="border-b px-6 py-3 bg-white"
      />

      <div className="p-5">
        <IGRPCard
          name="card-produtos-vendidos"
          tag="card-produtos-vendidos"
          className="rounded-2xl shadow-[0_2px_12px_rgba(53,121,246,0.07)] border border-slate-100"
        >
          <IGRPCardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                  VENDA
                </span>
                <h2 className="text-sm font-semibold text-gray-700">
                  Produtos / Serviços ({data?.totalElements ?? produtos.length})
                </h2>
              </div>
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
              <div className="animate-pulse space-y-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="h-10 rounded bg-gray-100" />
                ))}
              </div>
            ) : (
              <IGRPTable
                id="produtos-vendidos-table"
                tag="table-produtos-vendidos"
                content={produtos}
                columns={[
                  {
                    header: "Tipo",
                    accessorKey: "id",
                    render: () => (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                        Vendido
                      </span>
                    ),
                  },
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
                    render: (v) => formatCVE(v as number),
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
                    render: (v) => (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          v ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {(v as boolean) ? "Ativo" : "Inativo"}
                      </span>
                    ),
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
          </IGRPCardContent>
        </IGRPCard>
      </div>
    </IGRPContainer>
  );
}
