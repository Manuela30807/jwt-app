import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const hasSession = !!req.cookies.get("refresh_token")?.value;

  const next = () => {
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "no-store");
    return res;
  };

  if (req.nextUrl.pathname === "/") {
    return hasSession
      ? NextResponse.redirect(new URL("/dashboard", req.url))
      : next();
  }

  if (!hasSession) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/categorias/:path*",
    "/autores/:path*",
    "/livros/:path*",
    "/leitores/:path*",
    "/emprestimos/:path*",
    "/atendentes/:path*",
  ],
};
