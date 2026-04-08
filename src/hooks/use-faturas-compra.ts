"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CriarFaturaCompraRequest } from "@/app/(myapp)/types/efatura";
import { faturasCompraApi } from "@/lib/api/faturas-compra";

export const FATURAS_COMPRA_KEY = "faturas-compra" as const;

export function useFaturasCompra(page = 0, size = 10) {
  return useQuery({
    queryKey: [FATURAS_COMPRA_KEY, "list", page, size],
    queryFn: () => faturasCompraApi.listar(page, size),
  });
}

export function useFaturaCompra(id: number | null) {
  return useQuery({
    queryKey: [FATURAS_COMPRA_KEY, "detail", id],
    queryFn: () => faturasCompraApi.obter(id!),
    enabled: id !== null,
  });
}

export function useCriarFaturaCompra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CriarFaturaCompraRequest) =>
      faturasCompraApi.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FATURAS_COMPRA_KEY, "list"] });
    },
  });
}

export function useAtualizarFaturaCompra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CriarFaturaCompraRequest>;
    }) => faturasCompraApi.atualizar(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [FATURAS_COMPRA_KEY, "list"] });
      queryClient.setQueryData([FATURAS_COMPRA_KEY, "detail", data.id], data);
    },
  });
}

export function useConfirmarFaturaCompra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => faturasCompraApi.confirmar(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [FATURAS_COMPRA_KEY, "list"] });
      queryClient.setQueryData([FATURAS_COMPRA_KEY, "detail", data.id], data);
    },
  });
}
