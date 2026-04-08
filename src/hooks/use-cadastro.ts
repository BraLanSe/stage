"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Cliente,
  Entidade,
  Fornecedor,
  Produto,
} from "@/app/(myapp)/types/efatura";
import { cadastroApi } from "@/lib/api/cadastro";

export const CLIENTES_KEY = "clientes" as const;
export const FORNECEDORES_KEY = "fornecedores" as const;
export const PRODUTOS_KEY = "produtos" as const;
export const ENTIDADE_KEY = "entidade" as const;

// ── Clientes ─────────────────────────────────────────────────

export function useClientes(page = 0, size = 50) {
  return useQuery({
    queryKey: [CLIENTES_KEY, page, size],
    queryFn: () => cadastroApi.clientes.listar(page, size),
  });
}

export function useCliente(id: number | null) {
  return useQuery({
    queryKey: [CLIENTES_KEY, "detail", id],
    queryFn: () => cadastroApi.clientes.obter(id!),
    enabled: id !== null,
  });
}

export function useCriarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        Cliente,
        "id" | "createdAt" | "updatedAt" | "createdBy" | "lastModifiedBy"
      >,
    ) => cadastroApi.clientes.criar(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CLIENTES_KEY] }),
  });
}

export function useAtualizarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Cliente> }) =>
      cadastroApi.clientes.atualizar(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CLIENTES_KEY] }),
  });
}

// ── Fornecedores ──────────────────────────────────────────────

export function useFornecedores(page = 0, size = 50) {
  return useQuery({
    queryKey: [FORNECEDORES_KEY, page, size],
    queryFn: () => cadastroApi.fornecedores.listar(page, size),
  });
}

export function useFornecedor(id: number | null) {
  return useQuery({
    queryKey: [FORNECEDORES_KEY, "detail", id],
    queryFn: () => cadastroApi.fornecedores.obter(id!),
    enabled: id !== null,
  });
}

export function useCriarFornecedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        Fornecedor,
        "id" | "createdAt" | "updatedAt" | "createdBy" | "lastModifiedBy"
      >,
    ) => cadastroApi.fornecedores.criar(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [FORNECEDORES_KEY] }),
  });
}

export function useAtualizarFornecedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Fornecedor> }) =>
      cadastroApi.fornecedores.atualizar(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [FORNECEDORES_KEY] }),
  });
}

// ── Produtos ─────────────────────────────────────────────────

export function useProdutos(page = 0, size = 50, search?: string) {
  return useQuery({
    queryKey: [PRODUTOS_KEY, page, size, search],
    queryFn: () => cadastroApi.produtos.listar(page, size, search),
  });
}

export function useCriarProduto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        Produto,
        "id" | "createdAt" | "updatedAt" | "createdBy" | "lastModifiedBy"
      >,
    ) => cadastroApi.produtos.criar(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PRODUTOS_KEY] }),
  });
}

// ── Entidade ─────────────────────────────────────────────────

export function useEntidade() {
  return useQuery({
    queryKey: [ENTIDADE_KEY],
    queryFn: () => cadastroApi.entidade.obter(),
  });
}

export function useAtualizarEntidade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Entidade>) =>
      cadastroApi.entidade.atualizar(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ENTIDADE_KEY] }),
  });
}
