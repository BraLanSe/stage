"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
  IGRPTextarea,
} from "@igrp/igrp-framework-react-design-system";
import type { Cliente, TipoEntidade } from "@/app/(myapp)/types/efatura";
import { useAtualizarCliente, useCriarCliente } from "@/hooks/use-cadastro";
import { CONSELHOS, ILHAS, TIPOS_ENTIDADE } from "./shared";

type ClienteFormData = Omit<Cliente, "id" | "createdAt" | "updatedAt" | "createdBy" | "lastModifiedBy">;

function emptyCliente(): ClienteFormData {
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

export function ClienteModal({
  cliente,
  onClose,
}: {
  cliente: Cliente | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const criar = useCriarCliente();
  const atualizar = useAtualizarCliente();
  const isEditing = !!cliente?.id;

  const [form, setForm] = useState<ClienteFormData>(
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

  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const saving = criar.isPending || atualizar.isPending;
  const conselhos = CONSELHOS[form.ilha ?? "SANTIAGO"] ?? [];

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    try {
      if (isEditing && cliente?.id) {
        await atualizar.mutateAsync({ id: cliente.id, data: form });
        toast.success(`Cliente "${form.desig}" atualizado com sucesso!`);
        onClose();
      } else {
        await criar.mutateAsync(form);
        toast.success(`Cliente "${form.desig}" criado! A abrir nova fatura…`);
        router.push("/faturas-venda/nova");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao guardar cliente.");
    }
  }

  return (
    <IGRPModalDialog open onOpenChange={(o) => !o && onClose()}>
      <IGRPModalDialogContent size="lg">
        <IGRPModalDialogHeader>
          <IGRPModalDialogTitle name="modal-cliente-title" tag="modal-cliente-title">
            {isEditing ? `Editar #${cliente?.desig}` : "Novo Cliente"}
          </IGRPModalDialogTitle>
        </IGRPModalDialogHeader>

        <div className="p-6 max-h-[65vh] overflow-y-auto">
          <div className="flex gap-6">
            {/* Photo section */}
            <div className="flex flex-col items-start gap-3 w-40 flex-shrink-0">
              <p className="text-sm font-medium text-gray-700">Foto</p>
              <div className="relative w-40 h-44 border-2 border-dashed border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                {fotoPreview ? (
                  <>
                    {/* biome-ignore lint/performance/noImgElement: local preview */}
                    <img src={fotoPreview} alt="Foto" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full shadow text-xs text-gray-500 hover:text-red-500 flex items-center justify-center"
                      onClick={() => setFotoPreview(null)}
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <span className="text-gray-400 text-xs font-medium">Foto</span>
                )}
              </div>
              <label className="cursor-pointer w-full">
                <input type="file" accept="image/*" className="sr-only" onChange={handleFotoChange} />
                <span className="inline-flex items-center gap-1.5 w-full justify-center rounded-lg bg-[#3579f6] px-3 py-2 text-xs font-medium text-white hover:bg-[#2b65d4] transition-colors">
                  📷 Selecione a Photo
                </span>
              </label>
            </div>

            {/* Form fields */}
            <div className="flex-1 space-y-4 min-w-0">
              <div className="grid grid-cols-3 gap-3">
                <IGRPInputText name="codigo" tag="input-cliente-codigo" label="Código" disabled value={form.codigo ?? ""} />
                <IGRPInputText
                  name="nif" tag="input-cliente-nif" label="NIF"
                  value={form.nif ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, nif: e.target.value }))}
                />
                <IGRPSelect
                  name="tipoEntidade" tag="select-cliente-tipoEntidade" label="Tipo Cliente" required
                  options={TIPOS_ENTIDADE.map((t) => ({ label: t.label, value: t.value }))}
                  value={form.tipoEntidade}
                  onValueChange={(v) => setForm((p) => ({ ...p, tipoEntidade: v as TipoEntidade }))}
                />
                <div className="col-span-2">
                  <IGRPInputText
                    name="nome" tag="input-cliente-nome" label="Nome" required
                    value={form.desig}
                    onChange={(e) => setForm((p) => ({ ...p, desig: e.target.value }))}
                  />
                </div>
                <IGRPInputText
                  name="telefone" tag="input-cliente-telefone" label="Telemóvel" placeholder="Telefone..."
                  value={form.telefone ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))}
                />
              </div>

              <IGRPInputText
                name="email" tag="input-cliente-email" label="Email" type="email"
                value={form.email ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />

              <IGRPInputText
                name="pessoaContacto" tag="input-cliente-pessoaContacto" label="Pessoa de Contacto"
                placeholder="Informações de pessoa de contacto..."
                value={form.pessoaContacto ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, pessoaContacto: e.target.value }))}
              />

              <IGRPTextarea
                name="descricao" tag="textarea-cliente-descricao" label="Descrição" placeholder="Descr..." rows={2}
                value={form.descricao ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
              />

              <div>
                <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                  📍 Localidade/Morada
                </p>
                <div className="grid grid-cols-4 gap-3">
                  <IGRPSelect
                    name="ilha" tag="select-cliente-ilha" label="Ilha"
                    options={ILHAS.map((i) => ({ label: i, value: i }))}
                    value={form.ilha ?? "SANTIAGO"}
                    onValueChange={(v) => setForm((p) => ({ ...p, ilha: v, conselho: undefined }))}
                  />
                  <IGRPSelect
                    name="conselho" tag="select-cliente-conselho" label="Conselho" placeholder="Selecionar conselho…"
                    options={conselhos.map((c) => ({ label: c, value: c }))}
                    value={form.conselho || undefined}
                    onValueChange={(v) => setForm((p) => ({ ...p, conselho: v }))}
                  />
                  <IGRPInputText
                    name="freguesia" tag="input-cliente-freguesia" label="Freguesia"
                    value={form.freguesia ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, freguesia: e.target.value }))}
                  />
                  <IGRPInputText
                    name="localidade" tag="input-cliente-localidade" label="Localidade"
                    value={form.localidade ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, localidade: e.target.value }))}
                  />
                </div>
              </div>

              <IGRPInputText
                name="endereco" tag="input-cliente-endereco" label="Endereço" required
                value={form.endereco ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, endereco: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <IGRPModalDialogFooter>
          <IGRPButton name="fechar-cliente" tag="btn-fechar-cliente" variant="outline" onClick={onClose}>
            Fechar
          </IGRPButton>
          <IGRPButton
            name="guardar-cliente" tag="btn-guardar-cliente"
            loading={saving} loadingText="A guardar…"
            disabled={!form.desig.trim()} onClick={handleSave}
          >
            Guardar
          </IGRPButton>
        </IGRPModalDialogFooter>
      </IGRPModalDialogContent>
    </IGRPModalDialog>
  );
}
