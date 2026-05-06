export function printFatura(id: number): void {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8082/api/v1";
  const origin = apiBase.replace(/\/api\/v1\/?$/, "");
  window.open(`${origin}/print-service/fatura/${id}`, "_blank");
}
