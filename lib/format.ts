export const fmtDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("pt-BR") : "—";


export const fmtDateOnly = (value?: string | null) =>
  value ? value.split("-").reverse().join("/") : "—";

export const fmtMoney = (value?: number | null) =>
  (value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const fmtCpf = (cpf: string) =>
  cpf.length === 11 ? cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : cpf;
