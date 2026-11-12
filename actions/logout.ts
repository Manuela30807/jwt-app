"use server";

import { API_URL } from "@/lib/backend";
import { clearedCookieList, REFRESH_COOKIE } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
  const jar = await cookies();
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;

  if (refreshToken) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });
    } catch {}
  }

  for (const c of clearedCookieList) jar.set(c.name, c.value, c.options);
  redirect("/");
}
