import { API_URL } from "@/lib/backend";
import type { Tokens } from "@/lib/session";

// Single-flight: se várias requisições recebem 401 ao mesmo tempo, só UMA
// chamada de /auth/refresh sai; as demais aguardam a mesma promessa.
//
// O resultado fica guardado por alguns segundos porque requisições que já
// estavam a caminho ainda trazem o refresh token antigo no cookie. Reaproveitar
// o resultado evita reenviar um token já revogado, o que a API interpretaria
// como roubo de token e encerraria todas as sessões.
const REUSE_WINDOW_MS = 30_000;
const inflight = new Map<string, Promise<Tokens | null>>();

async function callRefresh(refreshToken: string): Promise<Tokens | null> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as Tokens;
  } catch {
    return null;
  }
}

export function refreshTokens(refreshToken: string): Promise<Tokens | null> {
  let promise = inflight.get(refreshToken);
  if (!promise) {
    promise = callRefresh(refreshToken).then((result) => {
      setTimeout(() => inflight.delete(refreshToken), result ? REUSE_WINDOW_MS : 0);
      return result;
    });
    inflight.set(refreshToken, promise);
  }
  return promise;
}
