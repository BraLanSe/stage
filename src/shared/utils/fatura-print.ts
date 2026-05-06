export function printFatura(id: number): void {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8082/api/v1";
  window.open(`${base}/pdf/faturas-venda/${id}`, "_blank");
}
