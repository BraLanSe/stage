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
import type { Cliente } from "@/app/(myapp)/types/efatura";
import { useClientes } from "@/hooks/use-cadastro";
import { ClienteModal } from "../cadastro/components/ClienteModal";

export default function CadastroClientesPage() {
  const { data, isLoading } = useClientes(0, 50);
  const clientes = data?.content ?? [];
  const [modal, setModal] = useState<Cliente | null | "new">(null);

  return (
    <IGRPContainer
      id="cadastro-clientes"
      name="cadastro-clientes"
      tag="cadastro-clientes"
      className="flex flex-col gap-0 p-0 bg-[#f7f9fc]"
    >
      {modal !== null && (
        <ClienteModal
          cliente={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
        />
      )}

      <IGRPPageHeader
        name="cadastro-clientes-header"
        tag="cadastro-clientes-header"
        title="Cadastro de Clientes"
        description="Registo e gestão dos clientes de venda"
        className="border-b px-6 py-3 bg-white"
      />

      <div className="p-5">
        <IGRPCard
          name="card-clientes"
          tag="card-clientes"
          className="rounded-2xl shadow-[0_2px_12px_rgba(53,121,246,0.07)] border border-slate-100"
        >
          <IGRPCardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                  VENDA
                </span>
                <h2 className="text-sm font-semibold text-gray-700">
                  Clientes ({data?.totalElements ?? clientes.length})
                </h2>
              </div>
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
              <div className="animate-pulse space-y-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="h-10 rounded bg-gray-100" />
                ))}
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
          </IGRPCardContent>
        </IGRPCard>
      </div>
    </IGRPContainer>
  );
}
