import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_URL } from "@/lib/backend";
import { refreshTokens } from "@/lib/refresh";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  clearedCookieList,
  sessionCookieList,
  type Tokens,
} from "@/lib/session";

// BFF: o navegador só fala com este handler. Aqui o servidor lê os cookies
// httpOnly, chama a API com o access token e, se vier 401, renova o par de
// tokens (uma única vez) e repete a requisição original.
async function handle(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  const joined = path.join("/");

  // Rotas de autenticação têm fluxo próprio (server actions).
  if (joined.startsWith("auth/") && joined !== "auth/me") {
    return NextResponse.json({ error: "Rota não permitida" }, { status: 403 });
  }

  const jar = await cookies();
  const access = jar.get(ACCESS_COOKIE)?.value;
  const refresh = jar.get(REFRESH_COOKIE)?.value;
  if (!refresh) {
    return NextResponse.json({ error: "Sessão expirada", code: "SESSION_EXPIRED" }, { status: 401 });
  }

  const target = `${API_URL}/${joined}${req.nextUrl.search}`;
  const body = req.method === "GET" || req.method === "HEAD" ? undefined : await req.text();

  const call = (token: string) =>
    fetch(target, {
      method: req.method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${token}`,
      },
      body: body || undefined,
      cache: "no-store",
    });

  let res = access ? await call(access) : null;
  let renewed: Tokens | null = null;

  if (!res || res.status === 401) {
    renewed = await refreshTokens(refresh);
    if (!renewed) {
      const out = NextResponse.json(
        { error: "Sessão expirada", code: "SESSION_EXPIRED" },
        { status: 401 },
      );
      for (const c of clearedCookieList) out.cookies.set(c.name, c.value, c.options);
      return out;
    }
    res = await call(renewed.accessToken);
  }

  const text = res.status === 204 ? null : await res.text();
  const out = new NextResponse(text, {
    status: res.status,
    headers: text ? { "Content-Type": res.headers.get("Content-Type") ?? "application/json" } : {},
  });

  if (renewed) {
    for (const c of sessionCookieList(renewed)) out.cookies.set(c.name, c.value, c.options);
  }
  return out;
}

export {
  handle as GET,
  handle as POST,
  handle as PUT,
  handle as PATCH,
  handle as DELETE,
};
