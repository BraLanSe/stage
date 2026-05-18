"use client";

import {
  IGRPButton,
  IGRPCard,
  IGRPCardContent,
  IGRPContainer,
  IGRPPageHeader,
  IGRPTable,
} from "@igrp/igrp-framework-react-design-system";
import { useState } from "react";
import type { Fornecedor } from "@/app/(myapp)/types/efatura";
import { useFornecedores } from "@/hooks/use-cadastro";
import { FornecedorModal } from "../cadastro/components/FornecedorModal";

export default function CadastroFornecedoresPage() {
  const { data, isLoading } = useFornecedores(0, 50);
  const fornecedores = data?.content ?? [];
  const [modal, setModal] = useState<Fornecedor | null | "new">(null);

  return (
    <IGRPContainer
      id="cadastro-fornecedores"
      name="cadastro-fornecedores"
      tag="cadastro-fornecedores"
      className="flex flex-col gap-0 p-0 bg-[#f7f9fc]"
    >
      {modal !== null && (
        <FornecedorModal
          fornecedor={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
        />
      )}

      <IGRPPageHeader
        name="cadastro-fornecedores-header"
        tag="cadastro-fornecedores-header"
        title="Cadastro de Fornecedores"
        description="Registo e gestão dos fornecedores de compra"
        className="border-b px-6 py-3 bg-white"
      />

      <div className="p-5">
        <IGRPCard
          name="card-fornecedores"
          tag="card-fornecedores"
          className="rounded-2xl shadow-[0_2px_12px_rgba(53,121,246,0.07)] border border-slate-100"
        >
          <IGRPCardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                  COMPRA
                </span>
                <h2 className="text-sm font-semibold text-gray-700">
                  Fornecedores ({data?.totalElements ?? fornecedores.length})
                </h2>
              </div>
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
              <div className="animate-pulse space-y-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="h-10 rounded bg-gray-100" />
                ))}
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
                    render: (v) => (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          v ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {(v as boolean) ? "Ativo" : "Inativo"}
                      </span>
                    ),
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
          </IGRPCardContent>
        </IGRPCard>
      </div>
    </IGRPContainer>
  );
}
