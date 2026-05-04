"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  IGRPButton,
  IGRPInputText,
  IGRPModalDialog,
  IGRPModalDialogContent,
  IGRPModalDialogFooter,
  IGRPModalDialogHeader,
  IGRPModalDialogTitle,
  IGRPSelect,
} from "@igrp/igrp-framework-react-design-system";
import type { Fornecedor, TipoEntidade } from "@/app/(myapp)/types/efatura";
import { useAtualizarFornecedor, useCriarFornecedor } from "@/hooks/use-cadastro";
import { CONSELHOS, ILHAS, TIPOS_ENTIDADE } from "./shared";

type FornecedorFormData = Omit<Fornecedor, "id" | "createdAt" | "updatedAt" | "createdBy" | "lastModifiedBy">;

function emptyFornecedor(): FornecedorFormData {
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

export function FornecedorModal({
  fornecedor,
  onClose,
}: {
  fornecedor: Fornecedor | null;
  onClose: () => void;
}) {
  const criar = useCriarFornecedor();
  const atualizar = useAtualizarFornecedor();
  const isEditing = !!fornecedor?.id;

  const [form, setForm] = useState<FornecedorFormData>(
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
    try {
      if (isEditing && fornecedor?.id) {
        await atualizar.mutateAsync({ id: fornecedor.id, data: form });
        toast.success(`Fornecedor "${form.desig}" atualizado com sucesso!`);
      } else {
        await criar.mutateAsync(form);
        toast.success(`Fornecedor "${form.desig}" criado com sucesso!`);
      }
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao guardar fornecedor.");
    }
  }

  return (
    <IGRPModalDialog open onOpenChange={(o) => !o && onClose()}>
      <IGRPModalDialogContent size="lg">
        <IGRPModalDialogHeader>
          <IGRPModalDialogTitle name="modal-fornecedor-title" tag="modal-fornecedor-title">
            {isEditing ? `Editar #${fornecedor?.desig}` : "Novo Fornecedor"}
          </IGRPModalDialogTitle>
        </IGRPModalDialogHeader>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <IGRPInputText name="codigo" tag="input-fornecedor-codigo" label="Código" disabled value={form.codigo ?? ""} />
            <IGRPInputText
              name="desig" tag="input-fornecedor-nome" label="Nome" required
              value={form.desig}
              onChange={(e) => setForm((p) => ({ ...p, desig: e.target.value }))}
            />
            <IGRPInputText
              name="email" tag="input-fornecedor-email" label="Email" type="email"
              value={form.email ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            />
            <IGRPInputText
              name="telefone" tag="input-fornecedor-telefone" label="Telefone"
              value={form.telefone ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))}
            />
            <IGRPInputText
              name="nif" tag="input-fornecedor-nif" label="NIF" required
              value={form.nif ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, nif: e.target.value }))}
            />
            <IGRPSelect
              name="tipoEntidade" tag="select-fornecedor-tipoEntidade" label="Tipo"
              options={TIPOS_ENTIDADE.map((t) => ({ label: t.label, value: t.value }))}
              value={form.tipoEntidade}
              onValueChange={(v) => setForm((p) => ({ ...p, tipoEntidade: v as TipoEntidade }))}
            />
          </div>

          <IGRPInputText
            name="morada" tag="input-fornecedor-morada" label="Endereço"
            value={form.morada ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, morada: e.target.value }))}
          />

          <div className="grid grid-cols-4 gap-3">
            <IGRPSelect
              name="ilha" tag="select-fornecedor-ilha" label="Ilha"
              options={ILHAS.map((i) => ({ label: i, value: i }))}
              value={form.ilha ?? "SANTIAGO"}
              onValueChange={(v) => setForm((p) => ({ ...p, ilha: v, conselho: undefined }))}
            />
            <IGRPSelect
              name="conselho" tag="select-fornecedor-conselho" label="Conselho" placeholder="Selecionar conselho…"
              options={conselhos.map((c) => ({ label: c, value: c }))}
              value={form.conselho || undefined}
              onValueChange={(v) => setForm((p) => ({ ...p, conselho: v }))}
            />
            <IGRPInputText
              name="freguesia" tag="input-fornecedor-freguesia" label="Freguesia"
              value={form.freguesia ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, freguesia: e.target.value }))}
            />
            <IGRPInputText
              name="localidade" tag="input-fornecedor-localidade" label="Localidade"
              value={form.localidade ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, localidade: e.target.value }))}
            />
          </div>
        </div>

        <IGRPModalDialogFooter>
          <IGRPButton name="fechar-fornecedor" tag="btn-fechar-fornecedor" variant="outline" onClick={onClose}>
            Fechar
          </IGRPButton>
          <IGRPButton
            name="guardar-fornecedor" tag="btn-guardar-fornecedor"
            loading={saving} loadingText="A guardar…"
            onClick={handleSave}
          >
            Guardar
          </IGRPButton>
        </IGRPModalDialogFooter>
      </IGRPModalDialogContent>
    </IGRPModalDialog>
  );
}
