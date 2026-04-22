"use client";

import { useRef, useState } from "react";
import { z } from "zod";
import {
  IGRPAlert,
  IGRPBadge,
  IGRPButton,
  IGRPCard,
  IGRPCardContent,
  IGRPCardHeader,
  IGRPCardTitle,
  IGRPDataTable,
  IGRPForm,
  IGRPInputText,
  IGRPPageHeader,
  type ColumnDef,
  type IGRPFormHandle,
} from "@igrp/igrp-framework-react-design-system";

const schema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
});

type FormValues = z.infer<typeof schema>;

type UserRow = {
  id: number;
  nome: string;
  email: string;
  status: "Active" | "Inactive";
};

const mockData: UserRow[] = [
  { id: 1, nome: "Ana Silva", email: "ana@example.com", status: "Active" },
  { id: 2, nome: "Bruno Costa", email: "bruno@example.com", status: "Inactive" },
  { id: 3, nome: "Carla Mendes", email: "carla@example.com", status: "Active" },
  { id: 4, nome: "David Ramos", email: "david@example.com", status: "Inactive" },
];

const columns: ColumnDef<UserRow>[] = [
  { accessorKey: "id", header: "ID", size: 60 },
  { accessorKey: "nome", header: "Nome" },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <IGRPBadge color={row.original.status === "Active" ? "success" : "destructive"}>
        {row.original.status}
      </IGRPBadge>
    ),
  },
];

export default function TestFeedbackPage() {
  const formRef = useRef<IGRPFormHandle<typeof schema> | null>(null);
  const [showError, setShowError] = useState(false);

  const onSubmit = async (_values: FormValues) => {
    setShowError(false);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <IGRPPageHeader
        title="Test Feedback"
        description="Form validation, error alerts, data table with status badges."
      />

      <IGRPCard>
        <IGRPCardHeader>
          <IGRPCardTitle>Formulário com Validação Zod</IGRPCardTitle>
        </IGRPCardHeader>
        <IGRPCardContent className="flex flex-col gap-4">
          {showError && (
            <IGRPAlert variant="soft" color="destructive">
              <div className="flex flex-col gap-1">
                <h4 className="font-semibold">Erro de Submissão</h4>
                <p className="text-sm">
                  A operação falhou. Verifique os dados e tente novamente.
                </p>
              </div>
            </IGRPAlert>
          )}

          <IGRPForm
            schema={schema}
            formRef={formRef}
            onSubmit={onSubmit}
            gridClassName="grid-cols-1 gap-4"
          >
            <IGRPInputText name="nome" label="Nome" required />
            <IGRPInputText name="email" label="Email" type="email" required />
            <div className="flex gap-2">
              <IGRPButton type="submit">Submeter</IGRPButton>
              <IGRPButton
                type="button"
                variant="outline"
                onClick={() => setShowError(true)}
              >
                Force Error
              </IGRPButton>
            </div>
          </IGRPForm>
        </IGRPCardContent>
      </IGRPCard>

      <IGRPCard>
        <IGRPCardHeader>
          <IGRPCardTitle>Tabela de Utilizadores</IGRPCardTitle>
        </IGRPCardHeader>
        <IGRPCardContent>
          <IGRPDataTable
            columns={columns}
            data={mockData}
            showPagination
            notFoundLabel="Nenhum utilizador encontrado."
          />
        </IGRPCardContent>
      </IGRPCard>
    </div>
  );
}
