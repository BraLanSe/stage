"use client";

import { useState } from "react";
import { toast } from "sonner";
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
  IGRPTextarea,
} from "@igrp/igrp-framework-react-design-system";
import type { Produto } from "@/app/(myapp)/types/efatura";
import { useAtualizarProduto, useCriarProduto } from "@/hooks/use-cadastro";

type ProdutoFormData = Omit<Produto, "id" | "createdAt" | "updatedAt" | "createdBy" | "lastModifiedBy">;

function emptyProduto(): ProdutoFormData {
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

export function ProdutoModal({
  produto,
  onClose,
}: {
  produto: Produto | null;
  onClose: () => void;
}) {
  const criar = useCriarProduto();
  const atualizar = useAtualizarProduto();
  const isEditing = !!produto?.id;

  const [form, setForm] = useState<ProdutoFormData>(
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
    try {
      if (isEditing && produto?.id) {
        await atualizar.mutateAsync({ id: produto.id, data: form });
        toast.success(`Produto "${form.desig}" atualizado com sucesso!`);
      } else {
        await criar.mutateAsync(form);
        toast.success(`Produto "${form.desig}" criado com sucesso!`);
      }
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao guardar produto.");
    }
  }

  return (
    <IGRPModalDialog open onOpenChange={(o) => !o && onClose()}>
      <IGRPModalDialogContent size="md">
        <IGRPModalDialogHeader>
          <IGRPModalDialogTitle name="modal-produto-title" tag="modal-produto-title">
            {isEditing ? `Editar — ${produto?.desig}` : "Novo Produto / Serviço"}
          </IGRPModalDialogTitle>
        </IGRPModalDialogHeader>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <IGRPInputText name="codigo" tag="input-produto-codigo" label="Código" disabled value={form.codigo} />
            <div className="col-span-2">
              <IGRPInputText
                name="desig" tag="input-produto-desig" label="Designação" required
                value={form.desig}
                onChange={(e) => setForm((p) => ({ ...p, desig: e.target.value }))}
              />
            </div>
          </div>

          <IGRPTextarea
            name="descr" tag="textarea-produto-descr" label="Descrição" rows={2}
            value={form.descr ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, descr: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <IGRPInputNumber
              name="preco" tag="input-produto-preco" label="Preço Unitário (CVE)"
              min={0} step={0.01}
              value={form.preco ?? 0}
              onChange={(v) => setForm((p) => ({ ...p, preco: v }))}
            />
            <IGRPInputNumber
              name="percentagemIva" tag="input-produto-percentagemIva" label="IVA (%)"
              min={0} max={100} step={0.01}
              value={form.percentagemIva ?? 15}
              onChange={(v) => setForm((p) => ({ ...p, percentagemIva: v }))}
            />
            <IGRPInputText
              name="unidade" tag="input-produto-unidade" label="Unidade" placeholder="Ex: un, kg, m²"
              value={form.unidade ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, unidade: e.target.value }))}
            />
            <IGRPInputText
              name="categoria" tag="input-produto-categoria" label="Categoria"
              value={form.categoria ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value }))}
            />
          </div>

          <IGRPCheckbox
            name="ativo" tag="checkbox-produto-ativo" label="Produto / Serviço ativo"
            checked={form.ativo}
            onCheckedChange={(checked) => setForm((p) => ({ ...p, ativo: !!checked }))}
          />
        </div>

        <IGRPModalDialogFooter>
          <IGRPButton name="cancelar-produto" tag="btn-cancelar-produto" variant="outline" onClick={onClose}>
            Cancelar
          </IGRPButton>
          <IGRPButton
            name="guardar-produto" tag="btn-guardar-produto"
            loading={saving} loadingText="A guardar…"
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
