"use client";

import { login } from "@/actions/login";
import { useActionState } from "react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, { error: null as string | null });

  return (
    <main className="login">
      <form action={formAction} className="card form">
        <h1>Biblioteca</h1>
        <p className="muted">Entre com seu e-mail e senha</p>

        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" required autoComplete="username" />

        <label htmlFor="password">Senha</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" />

        <button className="btn-unipar" disabled={isPending} type="submit">
          {isPending ? "Entrando…" : "Entrar"}
        </button>
        {state.error && <p className="alert error" role="alert">{state.error}</p>}
      </form>
    </main>
  );
}
