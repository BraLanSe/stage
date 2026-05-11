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
} from "@igrp/igrp-framework-react-design-system";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type DadosBancarios, dadosBancariosApi } from "@/lib/api/dados-bancarios";
/* IGRP-CUSTOM-CODE-END */

/* IGRP-CUSTOM-CODE-BEGIN(types) */
type FormValues = Required<Pick<DadosBancarios, "banco" | "nib" | "iban" | "swift" | "titular">>;
/* IGRP-CUSTOM-CODE-END */

export default function DadosBancariosPage() {
  /* IGRP-CUSTOM-CODE-BEGIN(hooks) */
  const qc = useQueryClient();
  const [editing, setEditing] = useState<DadosBancarios | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: lista = [], isLoading } = useQuery({
    queryKey: ["dados-bancarios"],
    queryFn: () => dadosBancariosApi.listar(),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { banco: "", nib: "", iban: "", swift: "", titular: "" },
  });

  const { mutateAsync: guardar, isPending: saving } = useMutation({
    mutationFn: (values: FormValues) =>
      editing?.id
        ? dadosBancariosApi.atualizar(editing.id, values)
        : dadosBancariosApi.criar(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dados-bancarios"] });
      toast.success(editing?.id ? "Dados bancários atualizados!" : "Conta bancária criada!");
      setShowForm(false);
      setEditing(null);
      reset({ banco: "", nib: "", iban: "", swift: "", titular: "" });
    },
    onError: () => toast.error("Erro ao guardar dados bancários."),
  });

  const { mutateAsync: remover } = useMutation({
    mutationFn: (id: number) => dadosBancariosApi.remover(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dados-bancarios"] });
      toast.success("Conta bancária removida.");
    },
    onError: () => toast.error("Erro ao remover conta bancária."),
  });

  function openEdit(item: DadosBancarios) {
    setEditing(item);
    reset({
      banco: item.banco ?? "",
      nib: item.nib ?? "",
      iban: item.iban ?? "",
      swift: item.swift ?? "",
      titular: item.titular ?? "",
    });
    setShowForm(true);
  }

  function openNew() {
    setEditing(null);
    reset({ banco: "", nib: "", iban: "", swift: "", titular: "" });
    setShowForm(true);
  }

  async function onSubmit(values: FormValues) {
    await guardar(values);
  }
  /* IGRP-CUSTOM-CODE-END */

  return (
    <IGRPContainer
      id="dados-bancarios"
      name="dados-bancarios"
      tag="dados-bancarios"
      className="mx-auto max-w-4xl p-6 bg-[#f7f9fc] min-h-screen"
    >
      <IGRPPageHeader
        name="dados-bancarios-header"
        tag="dados-bancarios-header"
        title="Dados Bancários"
        showBackButton
        urlBackButton="/empresa"
        backButtonText="Empresa"
      />

      <div className="mt-6 flex flex-col gap-6">
        {/* Action bar */}
        <div className="flex justify-end">
          <IGRPButton
            name="btn-nova-conta"
            tag="btn-nova-conta"
            type="button"
            onClick={openNew}
          >
            + Nova Conta Bancária
          </IGRPButton>
        </div>

        {/* Form card */}
        {showForm && (
          <IGRPCard
            name="card-form"
            tag="card-form"
            className="rounded-2xl shadow-[0_2px_12px_rgba(53,121,246,0.07)] border border-slate-100"
          >
            <IGRPCardContent className="p-6">
              <h2 className="mb-4 text-base font-semibold border-l-[3px] border-[#3579f6] pl-2">
                {editing?.id ? "Editar Conta Bancária" : "Nova Conta Bancária"}
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <IGRPInputText
                  id="banco"
                  tag="input-banco"
                  label="Banco"
                  placeholder="Ex: Banco Comercial do Atlântico"
                  error={errors.banco?.message}
                  {...register("banco", { required: "Nome do banco é obrigatório" })}
                />
                <IGRPInputText
                  id="titular"
                  tag="input-titular"
                  label="Titular"
                  placeholder="Nome do titular da conta"
                  error={errors.titular?.message}
                  {...register("titular")}
                />
                <IGRPInputText
                  id="nib"
                  tag="input-nib"
                  label="NIB"
                  placeholder="Ex: 0002 0000 0000 0000 0000 1"
                  error={errors.nib?.message}
                  {...register("nib")}
                />
                <IGRPInputText
                  id="iban"
                  tag="input-iban"
                  label="IBAN"
                  placeholder="Ex: CV64 0002 0000 0000 0000 1234 5"
                  error={errors.iban?.message}
                  {...register("iban")}
                />
                <IGRPInputText
                  id="swift"
                  tag="input-swift"
                  label="SWIFT / BIC"
                  placeholder="Ex: BCAPCVLX"
                  error={errors.swift?.message}
                  {...register("swift")}
                />
                <div className="col-span-full flex justify-end gap-3 pt-2">
                  <IGRPButton
                    name="btn-cancelar"
                    tag="btn-cancelar"
                    type="button"
                    variant="outline"
                    onClick={() => { setShowForm(false); setEditing(null); }}
                  >
                    Cancelar
                  </IGRPButton>
                  <IGRPButton
                    name="btn-guardar"
                    tag="btn-guardar"
                    type="submit"
                    loading={saving}
                    loadingText="A guardar…"
                  >
                    Guardar
                  </IGRPButton>
                </div>
              </form>
            </IGRPCardContent>
          </IGRPCard>
        )}

        {/* List */}
        <IGRPCard
          name="card-lista"
          tag="card-lista"
          className="rounded-2xl shadow-[0_2px_12px_rgba(53,121,246,0.07)] border border-slate-100"
        >
          <IGRPCardContent className="p-6">
            <h2 className="mb-4 text-base font-semibold border-l-[3px] border-[#3579f6] pl-2">
              Contas Bancárias Registadas
            </h2>

            {isLoading && (
              <p className="text-sm text-muted-foreground">A carregar…</p>
            )}

            {!isLoading && lista.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhuma conta bancária registada. Clique em &quot;Nova Conta Bancária&quot; para adicionar.
                </p>
              </div>
            )}

            {lista.length > 0 && (
              <div className="flex flex-col gap-3">
                {lista.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-0.5">
                      <p className="font-semibold text-gray-800">{item.banco}</p>
                      {item.titular && (
                        <p className="text-xs text-muted-foreground">Titular: {item.titular}</p>
                      )}
                      {item.nib && (
                        <p className="text-xs text-muted-foreground font-mono">NIB: {item.nib}</p>
                      )}
                      {item.iban && (
                        <p className="text-xs text-muted-foreground font-mono">IBAN: {item.iban}</p>
                      )}
                      {item.swift && (
                        <p className="text-xs text-muted-foreground font-mono">SWIFT: {item.swift}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <IGRPButton
                        name={`btn-editar-${item.id}`}
                        tag={`btn-editar-${item.id}`}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(item)}
                      >
                        Editar
                      </IGRPButton>
                      <IGRPButton
                        name={`btn-remover-${item.id}`}
                        tag={`btn-remover-${item.id}`}
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => item.id && remover(item.id)}
                      >
                        Remover
                      </IGRPButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </IGRPCardContent>
        </IGRPCard>
      </div>
    </IGRPContainer>
  );
}
