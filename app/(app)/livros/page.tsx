"use client";

import { useState } from "react";
import { useSession } from "@/components/SessionProvider";
import { Feedback, Loading } from "@/components/ui";
import { api, useApi } from "@/lib/client";
import type { Author, Book, Category } from "@/lib/types";

type Form = {
  title: string; isbn: string; year: string; totalCopies: string; categoryId: string; authorIds: number[];
};
const empty: Form = { title: "", isbn: "", year: "", totalCopies: "1", categoryId: "", authorIds: [] };

export default function LivrosPage() {
  const { isAdmin } = useSession();
  const categories = useApi<Category[]>("categories");
  const authors = useApi<Author[]>("authors");

  const [filters, setFilters] = useState({ title: "", categoryId: "", authorId: "", available: false });
  const params = new URLSearchParams();
  if (filters.title) params.set("title", filters.title);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.authorId) params.set("authorId", filters.authorId);
  if (filters.available) params.set("available", "true");
  const qs = params.toString();
  const books = useApi<Book[]>(`books${qs ? `?${qs}` : ""}`);

  const [editing, setEditing] = useState<Book | "new" | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [msg, setMsg] = useState<{ error?: string; success?: string }>({});

  const open = (book: Book | "new") => {
    setForm(
      book === "new"
        ? empty
        : {
            title: book.title,
            isbn: book.isbn,
            year: book.year?.toString() ?? "",
            totalCopies: String(book.totalCopies),
            categoryId: String(book.categoryId),
            authorIds: (book.authors ?? []).map((a) => a.id),
          },
    );
    setEditing(book);
    setMsg({});
  };

  const toggleAuthor = (id: number) =>
    setForm((f) => ({
      ...f,
      authorIds: f.authorIds.includes(id) ? f.authorIds.filter((x) => x !== id) : [...f.authorIds, id],
    }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const isNew = editing === "new";
      await api(`books${isNew ? "" : `/${(editing as Book).id}`}`, {
        method: isNew ? "POST" : "PUT",
        body: { ...form, year: form.year === "" ? null : Number(form.year), categoryId: Number(form.categoryId) },
      });
      setEditing(null);
      setMsg({ success: "Livro salvo com sucesso" });
      books.reload();
    } catch (err) {
      setMsg({ error: (err as Error).message });
    }
  }

  async function remove(book: Book) {
    if (!confirm(`Excluir o livro "${book.title}"?`)) return;
    try {
      await api(`books/${book.id}`, { method: "DELETE" });
      setMsg({ success: "Livro excluído" });
      books.reload();
    } catch (err) {
      setMsg({ error: (err as Error).message });
    }
  }

  return (
    <section>
      <div className="page-head">
        <h1>Livros</h1>
        {isAdmin && <button className="btn-unipar" onClick={() => open("new")}>Novo livro</button>}
      </div>

      <Feedback {...msg} />

      <div className="card row">
        <input
          placeholder="Título…"
          value={filters.title}
          onChange={(e) => setFilters({ ...filters, title: e.target.value })}
        />
        <select value={filters.categoryId} onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}>
          <option value="">Todas as categorias</option>
          {categories.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filters.authorId} onChange={(e) => setFilters({ ...filters, authorId: e.target.value })}>
          <option value="">Todos os autores</option>
          {authors.data?.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <label className="row">
          <input
            type="checkbox"
            checked={filters.available}
            onChange={(e) => setFilters({ ...filters, available: e.target.checked })}
          />
          Só disponíveis
        </label>
      </div>

      {editing && (
        <form className="card form" onSubmit={submit}>
          <h2>{editing === "new" ? "Novo livro" : "Editar livro"}</h2>
          <label>Título
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label>ISBN
            <input required value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
          </label>
          <div className="row">
            <label>Ano
              <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
            </label>
            <label>Exemplares
              <input
                type="number" min={1} required value={form.totalCopies}
                onChange={(e) => setForm({ ...form, totalCopies: e.target.value })}
              />
            </label>
          </div>
          <label>Categoria
            <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">Selecione…</option>
              {categories.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <fieldset>
            <legend>Autores (um ou mais)</legend>
            <div className="checks">
              {authors.data?.map((a) => (
                <label key={a.id}>
                  <input type="checkbox" checked={form.authorIds.includes(a.id)} onChange={() => toggleAuthor(a.id)} />
                  {a.name}
                </label>
              ))}
              {authors.data?.length === 0 && <span className="muted">Cadastre autores primeiro.</span>}
            </div>
          </fieldset>
          <div className="row">
            <button className="btn-unipar" type="submit" disabled={form.authorIds.length === 0}>Salvar</button>
            <button className="btn-light" type="button" onClick={() => setEditing(null)}>Cancelar</button>
          </div>
        </form>
      )}

      <Loading loading={books.loading} />
      <Feedback error={books.error} />
      {books.data && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Título</th><th>ISBN</th><th>Categoria</th><th>Autores</th><th>Disponíveis</th>{isAdmin && <th>Ações</th>}</tr>
            </thead>
            <tbody>
              {books.data.length === 0 && <tr><td colSpan={6} className="muted">Nenhum livro encontrado.</td></tr>}
              {books.data.map((b) => (
                <tr key={b.id}>
                  <td>{b.title}{b.year ? <small> ({b.year})</small> : null}</td>
                  <td>{b.isbn}</td>
                  <td>{b.category?.name}</td>
                  <td>{b.authors?.map((a) => a.name).join(", ")}</td>
                  <td>
                    <span className={`badge ${b.availableCopies > 0 ? "devolvido" : "atrasado"}`}>
                      {b.availableCopies} / {b.totalCopies}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="actions">
                      <button className="btn-link" onClick={() => open(b)}>Editar</button>
                      <button className="btn-link danger" onClick={() => remove(b)}>Excluir</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
