"use client";

import { useState } from "react";
import { api, useApi } from "@/lib/client";
import { Feedback, Loading } from "@/components/ui";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "date";
  required?: boolean;
};

type Props<T extends { id: number }> = {
  title: string;
  singular: string;
  endpoint: string;
  fields: Field[];
  columns: { header: string; render: (row: T) => React.ReactNode }[];
  canWrite: boolean;
  canDelete?: boolean;
  searchKey?: string;
  rowActions?: (row: T) => React.ReactNode;
};

export default function CrudPage<T extends { id: number }>({
  title, singular, endpoint, fields, columns, canWrite, canDelete = false, searchKey, rowActions,
}: Props<T>) {
  const [search, setSearch] = useState("");
  const path = searchKey && search ? `${endpoint}?${searchKey}=${encodeURIComponent(search)}` : endpoint;
  const { data, error, loading, reload } = useApi<T[]>(path);

  const [editing, setEditing] = useState<T | "new" | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ error?: string; success?: string }>({});

  const open = (row: T | "new") => {
    const values: Record<string, string> = {};
    for (const f of fields) {
      values[f.name] = row === "new" ? "" : String((row as unknown as Record<string, unknown>)[f.name] ?? "");
    }
    setForm(values);
    setEditing(row);
    setMsg({});
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const isNew = editing === "new";
      const id = isNew ? "" : `/${(editing as T).id}`;
      await api(`${endpoint}${id}`, { method: isNew ? "POST" : "PUT", body: form });
      setEditing(null);
      setMsg({ success: `${singular} salvo(a) com sucesso` });
      reload();
    } catch (err) {
      setMsg({ error: (err as Error).message });
    }
  }

  async function remove(row: T) {
    if (!confirm(`Excluir este(a) ${singular.toLowerCase()}?`)) return;
    try {
      await api(`${endpoint}/${row.id}`, { method: "DELETE" });
      setMsg({ success: `${singular} excluído(a)` });
      reload();
    } catch (err) {
      setMsg({ error: (err as Error).message });
    }
  }

  return (
    <section>
      <div className="page-head">
        <h1>{title}</h1>
        {canWrite && <button className="btn-unipar" onClick={() => open("new")}>Novo(a) {singular.toLowerCase()}</button>}
      </div>

      <Feedback {...msg} />

      {searchKey && (
        <input
          className="search"
          placeholder="Buscar…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      {editing && (
        <form className="card form" onSubmit={submit}>
          <h2>{editing === "new" ? `Novo(a) ${singular.toLowerCase()}` : `Editar ${singular.toLowerCase()}`}</h2>
          {fields.map((f) => (
            <label key={f.name}>
              {f.label}
              <input
                type={f.type ?? "text"}
                required={f.required}
                value={form[f.name] ?? ""}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
              />
            </label>
          ))}
          <div className="row">
            <button className="btn-unipar" type="submit">Salvar</button>
            <button className="btn-light" type="button" onClick={() => setEditing(null)}>Cancelar</button>
          </div>
        </form>
      )}

      <Loading loading={loading} />
      {error && <Feedback error={error} />}

      {data && (
        <table>
          <thead>
            <tr>
              {columns.map((c) => <th key={c.header}>{c.header}</th>)}
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr><td colSpan={columns.length + 1} className="muted">Nenhum registro encontrado.</td></tr>
            )}
            {data.map((row) => (
              <tr key={row.id}>
                {columns.map((c) => <td key={c.header}>{c.render(row)}</td>)}
                <td className="actions">
                  {rowActions?.(row)}
                  {canWrite && <button className="btn-link" onClick={() => open(row)}>Editar</button>}
                  {canWrite && canDelete && <button className="btn-link danger" onClick={() => remove(row)}>Excluir</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
