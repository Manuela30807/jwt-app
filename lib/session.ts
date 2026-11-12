import { cookies } from "next/headers";

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";
export const USER_COOKIE = "user";

export type SessionUser = {
  id: number;
  name: string;
  username: string;
  email: string;
  isAdmin: boolean;
};

export type Tokens = {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
};

const WEEK = 60 * 60 * 24 * 7; // mesma validade do refresh token

const base = {
  httpOnly: true, // JavaScript do navegador não consegue ler (protege contra XSS)
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

// O cookie do access token dura tanto quanto o refresh: quando o JWT expira
// (15 min) a API responde 401 e o servidor renova sozinho.
export function sessionCookieList(t: Tokens) {
  return [
    { name: ACCESS_COOKIE, value: t.accessToken, options: { ...base, maxAge: WEEK } },
    { name: REFRESH_COOKIE, value: t.refreshToken, options: { ...base, maxAge: WEEK } },
    { name: USER_COOKIE, value: JSON.stringify(t.user), options: { ...base, maxAge: WEEK } },
  ];
}

export const clearedCookieList = [ACCESS_COOKIE, REFRESH_COOKIE, USER_COOKIE].map((name) => ({
  name,
  value: "",
  options: { ...base, maxAge: 0 },
}));

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const raw = jar.get(USER_COOKIE)?.value;
  if (!raw || !jar.get(REFRESH_COOKIE)?.value) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}
