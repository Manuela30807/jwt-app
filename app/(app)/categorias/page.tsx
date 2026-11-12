"use client";

import CrudPage from "@/components/CrudPage";
import { useSession } from "@/components/SessionProvider";
import type { Category } from "@/lib/types";

export default function CategoriasPage() {
  const { isAdmin } = useSession();
  return (
    <CrudPage<Category>
      title="Categorias"
      singular="Categoria"
      endpoint="categories"
      canWrite={isAdmin}
      canDelete={isAdmin}
      fields={[
        { name: "name", label: "Nome", required: true },
        { name: "description", label: "Descrição" },
      ]}
      columns={[
        { header: "Nome", render: (c) => c.name },
        { header: "Descrição", render: (c) => c.description ?? "—" },
      ]}
    />
  );
}
