"use client";

import Link from "next/link";
import CrudPage from "@/components/CrudPage";
import { fmtCpf } from "@/lib/format";
import type { Reader } from "@/lib/types";

export default function LeitoresPage() {
  return (
    <CrudPage<Reader>
      title="Leitores"
      singular="Leitor"
      endpoint="readers"
      canWrite
      searchKey="name"
      fields={[
        { name: "name", label: "Nome", required: true },
        { name: "cpf", label: "CPF", required: true },
        { name: "email", label: "E-mail", type: "email" },
        { name: "phone", label: "Telefone" },
      ]}
      columns={[
        { header: "Nome", render: (r) => r.name },
        { header: "CPF", render: (r) => fmtCpf(r.cpf) },
        { header: "E-mail", render: (r) => r.email ?? "—" },
        { header: "Telefone", render: (r) => r.phone ?? "—" },
      ]}
      rowActions={(r) => <Link className="btn-link" href={`/leitores/${r.id}`}>Histórico</Link>}
    />
  );
}
