"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CriarFaturaVendaRequest } from "@/app/(myapp)/types/efatura";
import { faturasVendaApi } from "@/lib/api/faturas-venda";

export const FATURAS_VENDA_KEY = "faturas-venda" as const;

export function useFaturasVenda(page = 0, size = 10) {
  return useQuery({
    queryKey: [FATURAS_VENDA_KEY, "list", page, size],
    queryFn: () => faturasVendaApi.listar(page, size),
  });
}

export function useFaturaVenda(id: number | null) {
  return useQuery({
    queryKey: [FATURAS_VENDA_KEY, "detail", id],
    queryFn: () => faturasVendaApi.obter(id!),
    enabled: id !== null,
  });
}

export function useCriarFaturaVenda() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CriarFaturaVendaRequest) => faturasVendaApi.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FATURAS_VENDA_KEY, "list"] });
    },
  });
}

export function useConfirmarFaturaVenda() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => faturasVendaApi.confirmar(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [FATURAS_VENDA_KEY, "list"] });
      queryClient.setQueryData([FATURAS_VENDA_KEY, "detail", data.id], data);
    },
  });
}
