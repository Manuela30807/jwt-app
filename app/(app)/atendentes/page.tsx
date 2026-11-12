"use client";

import { useState } from "react";
import { useSession } from "@/components/SessionProvider";
import { Badge, Feedback, Loading } from "@/components/ui";
import { api, useApi } from "@/lib/client";
import type { Attendant } from "@/lib/types";

type Form = { name: string; username: string; email: string; password: string; isAdmin: boolean };
const empty: Form = { name: "", username: "", email: "", password: "", isAdmin: false };

export default function AtendentesPage() {
  const me = useSession();
  const users = useApi<Attendant[]>(me.isAdmin ? "user" : null);
  const [editing, setEditing] = useState<Attendant | "new" | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [msg, setMsg] = useState<{ error?: string; success?: string }>({});

  if (!me.isAdmin) return <p className="alert error">Acesso restrito a administradores.</p>;

  const open = (u: Attendant | "new") => {
    setForm(u === "new" ? empty : { name: u.name, username: u.username, email: u.email, password: "", isAdmin: u.isAdmin });
    setEditing(u);
    setMsg({});
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const isNew = editing === "new";
      await api(`user${isNew ? "" : `/${(editing as Attendant).id}`}`, {
        method: isNew ? "POST" : "PUT",
        body: form,
      });
      setEditing(null);
      setMsg({ success: "Atendente salvo com sucesso" });
      users.reload();
    } catch (err) {
      setMsg({ error: (err as Error).message });
    }
  }

  async function toggle(u: Attendant) {
    try {
      await api(`user/${u.id}/active`, { method: "PATCH", body: { active: !u.active } });
      setMsg({ success: u.active ? "Atendente desativado" : "Atendente ativado" });
      users.reload();
    } catch (err) {
      setMsg({ error: (err as Error).message });
    }
  }

  return (
    <section>
      <div className="page-head">
        <h1>Atendentes</h1>
        <button className="btn-unipar" onClick={() => open("new")}>Novo atendente</button>
      </div>
      <Feedback {...msg} />

      {editing && (
        <form className="card form" onSubmit={submit}>
          <h2>{editing === "new" ? "Novo atendente" : "Editar atendente"}</h2>
          <label>Nome
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>Usuário
            <input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </label>
          <label>E-mail
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label>{editing === "new" ? "Senha" : "Nova senha (deixe em branco para manter)"}
            <input
              type="password" minLength={6} required={editing === "new"} autoComplete="new-password"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          <label className="row">
            <input type="checkbox" checked={form.isAdmin} onChange={(e) => setForm({ ...form, isAdmin: e.target.checked })} />
            Administrador
          </label>
          <div className="row">
            <button className="btn-unipar" type="submit">Salvar</button>
            <button className="btn-light" type="button" onClick={() => setEditing(null)}>Cancelar</button>
          </div>
        </form>
      )}

      <Loading loading={users.loading} />
      <Feedback error={users.error} />
      {users.data && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Nome</th><th>Usuário</th><th>E-mail</th><th>Perfil</th><th>Situação</th><th>Ações</th></tr></thead>
            <tbody>
              {users.data.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.isAdmin ? "Administrador" : "Atendente"}</td>
                  <td><Badge status={u.active ? "ATIVO" : "INATIVO"} /></td>
                  <td className="actions">
                    <button className="btn-link" onClick={() => open(u)}>Editar</button>
                    {u.id !== me.id && (
                      <button className="btn-link danger" onClick={() => toggle(u)}>{u.active ? "Desativar" : "Ativar"}</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
