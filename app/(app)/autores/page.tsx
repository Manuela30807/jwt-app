"use client";

import CrudPage from "@/components/CrudPage";
import { useSession } from "@/components/SessionProvider";
import { fmtDateOnly } from "@/lib/format";
import type { Author } from "@/lib/types";

export default function AutoresPage() {
  const { isAdmin } = useSession();
  return (
    <CrudPage<Author>
      title="Autores"
      singular="Autor"
      endpoint="authors"
      canWrite={isAdmin}
      canDelete={isAdmin}
      fields={[
        { name: "name", label: "Nome", required: true },
        { name: "nationality", label: "Nacionalidade" },
        { name: "birthDate", label: "Data de nascimento", type: "date" },
      ]}
      columns={[
        { header: "Nome", render: (a) => a.name },
        { header: "Nacionalidade", render: (a) => a.nationality ?? "—" },
        { header: "Nascimento", render: (a) => fmtDateOnly(a.birthDate) },
      ]}
    />
  );
}
