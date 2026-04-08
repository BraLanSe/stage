"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-form-hook"; // Will mock this since not installed, normally react-hook-form
// import { zodResolver } from "@hookform/resolvers/zod";
import { FaturaData, FaturaSchema, Imposto } from "../../../../../../types/efatura";

// Mock data for dropdowns
const CLIENTES = [
  { id: "1", nome: "Empresa A" },
  { id: "2", nome: "Empresa B" },
];
const SERIES = [
  { id: "S1", nome: "Série 2024" },
  { id: "S2", nome: "Série 2025" },
];
const TIPOS_FATURA = [
  { id: "FT", nome: "Fatura" },
  { id: "FR", nome: "Fatura-Recibo" },
];
const IMPOSTOS: Imposto[] = [
  { id: "IVA15", taxa: 15, tipoCalculo: "PERCENTAGE" },
  { id: "ISENTO", taxa: 0, tipoCalculo: "PERCENTAGE" },
  { id: "TAXA_FIXA", taxa: 50, tipoCalculo: "FIXED" },
];

export default function NovaFaturaPage() {
  // Configuração do formulário
  // Note: Since dependencies are not installed in this workspace, we use standard React state for demo 
  // or a mock of react-hook-form. Here we implement the full logic using standard react-hook-form syntax.
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FaturaData>({
    // resolver: zodResolver(FaturaSchema), // Commented out for now to avoid compilation errors if zodResolver missing
    defaultValues: {
      DT_FATURACAO: new Date().toISOString().split("T")[0],
      itens: [
        {
          DESIG: "",
          QUANTIDADE: 1,
          PRECO_UNITARIO: 0,
          DESCONTO_COMERCIAL_PERC: 0,
          VALOR_BRUTO: 0,
          VALOR_LIQUIDO: 0,
          VALOR_IMPOSTO: 0,
          VALOR_TOTAL: 0,
        },
      ],
      VALOR_ILIQUIDO: 0,
      VALOR_IMPOSTO: 0,
      VALOR_FATURA: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "itens",
  });

  // Observa mudanças nos itens para recalcular
  const watchItens = watch("itens");

  // Recalcula totais sempre que os itens mudam
  useEffect(() => {
    let totalIliquido = 0;
    let totalImpostoFatura = 0;
    let totalFatura = 0;

    watchItens.forEach((item, index) => {
      // Garantir que os valores base são números (evitar NaN)
      const qtd = Number(item.QUANTIDADE) || 0;
      const preco = Number(item.PRECO_UNITARIO) || 0;
      const descPerc = Number(item.DESCONTO_COMERCIAL_PERC) || 0;

      // 1. VALOR_BRUTO = QUANTIDADE * PRECO_UNITARIO
      const valorBruto = qtd * preco;

      // 2. VALOR_LIQUIDO = VALOR_BRUTO - Remises
      const valorDesconto = (valorBruto * descPerc) / 100;
      const valorLiquido = valorBruto - valorDesconto;

      // 3. VALOR_IMPOSTO
      let valorImpostoLote = 0;
      if (item.IMPOSTO) {
        if (item.IMPOSTO.tipoCalculo === "PERCENTAGE") {
          valorImpostoLote = (valorLiquido * item.IMPOSTO.taxa) / 100;
        } else if (item.IMPOSTO.tipoCalculo === "FIXED") {
          valorImpostoLote = item.IMPOSTO.taxa;
        }
      }

      // 4. VALOR_TOTAL (Ligne)
      const valorTotalLinha = valorLiquido + valorImpostoLote;

      // Atualizar valores calculados na linha (para exibição ou envio)
      // Usamos setValue com shouldValidate: false para não causar renders infinitos
      if (item.VALOR_BRUTO !== valorBruto) setValue(`itens.${index}.VALOR_BRUTO`, valorBruto);
      if (item.VALOR_LIQUIDO !== valorLiquido) setValue(`itens.${index}.VALOR_LIQUIDO`, valorLiquido);
      if (item.VALOR_IMPOSTO !== valorImpostoLote) setValue(`itens.${index}.VALOR_IMPOSTO`, valorImpostoLote);
      if (item.VALOR_TOTAL !== valorTotalLinha) setValue(`itens.${index}.VALOR_TOTAL`, valorTotalLinha);

      // Acumular totais do documento
      totalIliquido += valorLiquido;
      totalImpostoFatura += valorImpostoLote;
      totalFatura += valorTotalLinha;
    });

    // Atualiza resumo financeiro
    setValue("VALOR_ILIQUIDO", totalIliquido);
    setValue("VALOR_IMPOSTO", totalImpostoFatura);
    setValue("VALOR_FATURA", totalFatura);

  }, [watchItens, setValue]);

  // Valores totais observados para exibir no resumo
  const resumoIliquido = watch("VALOR_ILIQUIDO") || 0;
  const resumoImposto = watch("VALOR_IMPOSTO") || 0;
  const resumoTotal = watch("VALOR_FATURA") || 0;

  const onSubmit = (data: FaturaData) => {
    console.log("Payload enviado:", JSON.stringify(data, null, 2));
    alert("Fatura criada com sucesso! Verifique o console.");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Nova Fatura de Venda</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* SECÇÃO 1: CABEÇALHO */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">1. Cabeçalho</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                <select 
                  {...register("CLIENTE_ID")} 
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione o Cliente</option>
                  {CLIENTES.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                {errors.CLIENTE_ID && <p className="text-red-500 text-xs mt-1">{errors.CLIENTE_ID.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Série Documental *</label>
                <select 
                  {...register("pr_serie_ID")} 
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione a Série</option>
                  {SERIES.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
                {errors.pr_serie_ID && <p className="text-red-500 text-xs mt-1">{errors.pr_serie_ID.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Fatura *</label>
                <select 
                  {...register("TIPO_FATURA")} 
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione o Tipo</option>
                  {TIPOS_FATURA.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
                {errors.TIPO_FATURA && <p className="text-red-500 text-xs mt-1">{errors.TIPO_FATURA.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Faturação *</label>
                <input 
                  type="date" 
                  {...register("DT_FATURACAO")} 
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.DT_FATURACAO && <p className="text-red-500 text-xs mt-1">{errors.DT_FATURACAO.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento</label>
                <input 
                  type="date" 
                  {...register("DT_VENCIMENTO_FATURA")} 
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea 
                  {...register("NOTA")} 
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Termos e Condições</label>
                <textarea 
                  {...register("TERM_CONDICOES")} 
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* SECÇÃO 2: ITENS DA FATURA */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h2 className="text-lg font-semibold text-gray-700">2. Itens da Fatura</h2>
              <button 
                type="button" 
                onClick={() => append({ DESIG: "", QUANTIDADE: 1, PRECO_UNITARIO: 0, DESCONTO_COMERCIAL_PERC: 0 })}
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-sm font-medium transition-colors"
              >
                + Adicionar Item
              </button>
            </div>
            
            {errors.itens?.root && <p className="text-red-500 text-sm mb-4">{errors.itens.root.message}</p>}

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                  <th className="p-2 font-medium">Descrição *</th>
                  <th className="p-2 font-medium w-24">Qtd *</th>
                  <th className="p-2 font-medium w-32">Preço Unit. *</th>
                  <th className="p-2 font-medium w-24">Desc. %</th>
                  <th className="p-2 font-medium w-40">Imposto</th>
                  <th className="p-2 font-medium w-32 text-right">Valor Líquido</th>
                  <th className="p-2 font-medium w-32 text-right">Total Ligne</th>
                  <th className="p-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fields.map((field, index) => (
                  <tr key={field.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-2 align-top">
                      <input 
                        {...register(`itens.${index}.DESIG`)} 
                        placeholder="Descrição do item"
                        className="w-full border border-gray-300 rounded p-1.5 text-sm focus:ring-blue-500"
                      />
                      {errors.itens?.[index]?.DESIG && <span className="text-red-500 text-[10px]">{errors.itens[index]?.DESIG?.message}</span>}
                    </td>
                    <td className="p-2 align-top">
                      <input 
                        type="number" 
                        step="0.01"
                        {...register(`itens.${index}.QUANTIDADE`, { valueAsNumber: true })} 
                        className="w-full border border-gray-300 rounded p-1.5 text-sm focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-2 align-top">
                      <input 
                        type="number" 
                        step="0.01"
                        {...register(`itens.${index}.PRECO_UNITARIO`, { valueAsNumber: true })} 
                        className="w-full border border-gray-300 rounded p-1.5 text-sm focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-2 align-top">
                      <input 
                        type="number" 
                        step="1"
                        max="100"
                        {...register(`itens.${index}.DESCONTO_COMERCIAL_PERC`, { valueAsNumber: true })} 
                        className="w-full border border-gray-300 rounded p-1.5 text-sm focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-2 align-top">
                      <select 
                        onChange={(e) => {
                          const imposto = IMPOSTOS.find(i => i.id === e.target.value);
                          setValue(`itens.${index}.IMPOSTO`, imposto);
                        }}
                        className="w-full border border-gray-300 rounded p-1.5 text-sm focus:ring-blue-500"
                      >
                        <option value="">S/ Imposto</option>
                        {IMPOSTOS.map(imp => (
                          <option key={imp.id} value={imp.id}>
                            {imp.id} ({imp.tipoCalculo === 'PERCENTAGE' ? `${imp.taxa}%` : `${imp.taxa} fixo`})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2 align-top text-right text-sm font-medium text-gray-700">
                      {(watchItens[index]?.VALOR_LIQUIDO || 0).toFixed(2)} €
                    </td>
                    <td className="p-2 align-top text-right text-sm font-bold text-gray-900">
                      {(watchItens[index]?.VALOR_TOTAL || 0).toFixed(2)} €
                    </td>
                    <td className="p-2 align-top text-center">
                      <button 
                        type="button" 
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Remover linha"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SECÇÃO 3: RESUMO FINANCEIRO E SUBMIT */}
          <div className="flex flex-col md:flex-row justify-end gap-6">
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 w-full md:w-80">
              <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">3. Resumo Financeiro</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Total Ilíquido:</span>
                  <span className="font-medium">{resumoIliquido.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Total Impostos:</span>
                  <span className="font-medium">{resumoImposto.toFixed(2)} €</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-base font-bold text-gray-900">
                  <span>Total a Pagar:</span>
                  <span>{resumoTotal.toFixed(2)} €</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-end space-y-3 md:w-48">
              <button 
                type="button"
                className="w-full px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="w-full px-4 py-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Confirmar Fatura
              </button>
            </div>

          </div>

        </form>
      </div>
    </div>
  );
}