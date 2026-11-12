"use server";

import { API_URL } from "@/lib/backend";
import { sessionCookieList, type Tokens } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(
  _prevState: { error: null | string },
  formData: FormData,
) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Informe e-mail e senha" };
  }

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return { error: data?.error ?? "Erro ao fazer login" };
    }

    const jar = await cookies();
    for (const c of sessionCookieList(data as Tokens)) {
      jar.set(c.name, c.value, c.options);
    }
  } catch {
    return { error: "Não foi possível conectar à API" };
  }

  redirect("/dashboard");
}
